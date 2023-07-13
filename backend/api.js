import { balanceOf, getStarknetEoaAddress, transfer } from './onchain.js';

export function initRoutes(app) {
    app.get('/health', async (req, res) => {
        res.send("ok")
    });

    app.post('/faucet', async (req, res) => {
        try {
            const toAddress = req.body.to;  // Input to be provided in the request body
            if (!toAddress) {
                return res.status(400).json({ message: 'Missing "to" address in request body.' });
            }

            const starknetEoaAddress = await getStarknetEoaAddress(toAddress)
            const txHash = await transfer(starknetEoaAddress);

            return res.json({ message: `Transfer successful. Transaction hash: ${txHash}`, hash: txHash });
        } catch (error) {
            console.error(`Error in /transfer: ${error.message}`);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    app.post('/balance', async (req, res) => {
        try {
            const ofAddress = req.body.of;
            if (!ofAddress) {
                return res.status(400).json({ message: 'Missing "of" address in request body.' });
            }
            const starknetEoaAddress = await getStarknetEoaAddress(ofAddress)
            const balance = await balanceOf(starknetEoaAddress);

            return res.json({ message: `Query successful.`, balance: balance });
        } catch (error) {
            console.error(`Error in /balance: ${error.message}`);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}
