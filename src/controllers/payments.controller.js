import fs from "fs";
import multer from "multer";
import { createAuthenticatedClient, isFinalizedGrant } from "@interledger/open-payments";

const upload = multer({ dest: "uploads/" }); 

export const processPayment = async (req, res) => {
  try {
    const { walletAddressUrl, keyId, amount, receivingWalletUrl } = req.body;

    if (!req.file) throw new Error("No se envió la private key del cliente");
    const privateKey = fs.readFileSync(req.file.path, "utf8");

    const client = await createAuthenticatedClient({ walletAddressUrl, privateKey, keyId });
    const sendingWallet = await client.walletAddress.get({ url: walletAddressUrl });
    const receivingWallet = await client.walletAddress.get({ url: receivingWalletUrl });

    const incomingGrant = await client.grant.request(
      { url: receivingWallet.authServer },
      { access_token: { access: [{ type: "incoming-payment", actions: ["create"] }] } }
    );
    if (!isFinalizedGrant(incomingGrant)) throw new Error("Grant de incoming payment no finalizado");

    const incomingPayment = await client.incomingPayment.create(
      { url: receivingWallet.resourceServer, accessToken: incomingGrant.access_token.value },
      {
        walletAddress: receivingWallet.id,
        incomingAmount: {
          assetCode: receivingWallet.assetCode,
          assetScale: receivingWallet.assetScale,
          value: amount,
        },
      }
    );

    const quoteGrant = await client.grant.request(
      { url: sendingWallet.authServer },
      { access_token: { access: [{ type: "quote", actions: ["create"] }] } }
    );
    if (!isFinalizedGrant(quoteGrant)) throw new Error("Grant de quote no finalizado");

    const quote = await client.quote.create(
      { url: receivingWallet.resourceServer, accessToken: quoteGrant.access_token.value },
      {
        walletAddress: sendingWallet.id,
        receiver: incomingPayment.id,
        method: "ilp",
      }
    );

    const outgoingGrant = await client.grant.request(
      { url: sendingWallet.authServer },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["create"],
              limits: { debitAmount: quote.debitAmount },
              identifier: sendingWallet.id,
            },
          ],
        },
        interact: { start: ["redirect"] },
      }
    );

    res.json({
      sendingWallet,
      receivingWallet,
      incomingPayment,
      quote,
      outgoingPaymentGrant: outgoingGrant,
      interactUrl: outgoingGrant.interact.redirect,
    });

    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Finalizar pago
 */
export const finalizePayment = async (req, res) => {
  try {
    const { walletAddressUrl, keyId, outgoingPaymentGrant, quoteId, privateKey } = req.body;
    if (!privateKey) throw new Error("Se requiere la private key del cliente");

    const client = await createAuthenticatedClient({ walletAddressUrl, keyId, privateKey });
    const sendingWallet = await client.walletAddress.get({ url: walletAddressUrl });

    const finalizedGrant = await client.grant.continue({
      url: outgoingPaymentGrant.continue.uri,
      accessToken: outgoingPaymentGrant.continue.access_token.value
    });
    if (!isFinalizedGrant(finalizedGrant)) throw new Error("Grant de outgoing payment no finalizado");

    const outgoingPayment = await client.outgoingPayment.create(
      { url: sendingWallet.resourceServer, accessToken: finalizedGrant.access_token.value },
      { walletAddress: sendingWallet.id, quoteId }
    );

    res.json({ outgoingPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const uploadMiddleware = upload.single("privateKeyFile");
