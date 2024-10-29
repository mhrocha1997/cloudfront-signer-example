import express from 'express';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';
const privateKeySecretId = process.env.PRIVATE_KEY_SECRET_ID || '';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

app.post('/signed-url', async (req, res) => {
    try {
        const { s3ObjectKey } = req.body;
        const url = `${cloudfrontDomain}/${s3ObjectKey}`
        
        const keyPairId = process.env.KEY_PAIR_ID || ''

        const secretCommand = new GetSecretValueCommand({ SecretId: privateKeySecretId });
        const secretResponse = await client.send(secretCommand);
        const privateKey = secretResponse.SecretString || '';

        const dateLessThan = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        const signedUrl = getSignedUrl({
            url,
            keyPairId,
            privateKey,
            dateLessThan
        })

        res.json({ signedUrl });
    } catch (error) {
        console.error('Error generating signed URL', error);
        res.status(500).send('Error generating signed URL');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
