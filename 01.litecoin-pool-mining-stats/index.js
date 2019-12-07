const Alexa = require('ask-sdk-core');
const https = require('https');
const hostname = 'www.litecoinpool.org';
const path = '/api?api_key=';
const apiKey = 'INSERT YOUR API KEY HERE';
const currency = 'USD'; // Set to one of the following currency abbreviations: USD, CAD, EUR, GBP, RUB, CNY, AUD, or ZAR.

/// <summary>
/// A class containing an asychronous function which sends an https GET request. The data returned with the promise resolve is a JSON formatted string.
/// </summary>
class HttpsRequestClient {
    getData() {
        const requestOptions = this.__getRequestOptions();
        return new Promise((resolve, reject) => {
            const request = https.request(requestOptions, (response) => {
                const chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                response.on('end', () => {
                    const responseString = chunks.join('');
                    resolve(responseString);
                });
            });
            request.on('error', (err) => {
                reject(err);
            });
            request.end();
        });
    }

    __getRequestOptions() {
        return {
            hostname: hostname,
            path: path + apiKey,
            method: 'GET'
        };
    }
}

/// <summary>
/// This handler is called then the skill is opened without the user including an initial utterance (by just saying 'Alexa, open Litecoin pool').
/// Rather than list the questions you can ask this skill, opening it will provide a quick summary of information from your account at litecoinpool.org.
/// </summary>
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        speakOutput = `Here is a quick summary of your Litecoin pool mining stats.`;

        // The hash rate is returned as kilohash. Convert it to hash for ease of formatting.
        obj.user.hash_rate = obj.user.hash_rate * 1000;

        // Format the hash rate as zettahash if it's greather than or equal to one sextillion hash. 
        if (obj.user.hash_rate >= 1000000000000000000000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000000000).toFixed(1))} zettahash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000000000000000000000).toFixed(1))} ZH/s`;
        }

        // Format the hash rate as exahash if it's less than one sextillion hash, but greather than or equal to one quintillion hash. 
        if (obj.user.hash_rate < 1000000000000000000000 && obj.user.hash_rate >= 1000000000000000000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000000).toFixed(1))} exahash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000000000000000000).toFixed(1))} EH/s`;
        }

        // Format the hash rate as petahash if it's less than one quintillion hash, but greather than or equal to one quadrillion hash. 
        if (obj.user.hash_rate < 1000000000000000000 && obj.user.hash_rate >= 1000000000000000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000).toFixed(1))} petahash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000000000000000).toFixed(1))} PH/s`;
        }

        // Format the hash rate as terahash if it's less than one quadrillion hash, but greather than or equal to one trillion hash. 
        if (obj.user.hash_rate < 1000000000000000 && obj.user.hash_rate >= 1000000000000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000).toFixed(1))} terahash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000000000000).toFixed(1))} TH/s`;
        }

        // Format the hash rate as gigahash if it's less than one trillion hash, but greater than or equal to one billion hash. 
        if (obj.user.hash_rate < 1000000000000 && obj.user.hash_rate >= 1000000000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000).toFixed(1))} gigahash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000000000).toFixed(1))} GH/s`;
        }

        // Format the hash rate as megahash if it's less than one billion hash, but greater than or equal to one hundred million hash. 
        if (obj.user.hash_rate < 1000000000 && obj.user.hash_rate >= 100000000) {
            speakOutput = ` ${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000).toFixed(1))} megahash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000000).toFixed(1))} MH/s`;
        }

        // Format the hash rate as kilohash if it's less than one hundred million hash, but greater than or equal to one thousand hash. 
        if (obj.user.hash_rate < 100000000 && obj.user.hash_rate >= 1000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000).toFixed(1))} kilohash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate / 1000).toFixed(1))} kH/s`;
        }

        // Format the hash rate as just hash if it's less than one thousand hash. 
        if (obj.user.hash_rate < 1000) {
            speakOutput = `${speakOutput} Your current hash rate is ${addCommas(Number(obj.user.hash_rate).toFixed(1))} hash per second.`;
            cardContent = `Hash rate: ${addCommas(Number(obj.user.hash_rate).toFixed(1))} H/s`;
        }

        if (obj.user.hash_rate === 0) {
            speakOutput = `${speakOutput} You don't appear to have any active miners.`;
            cardContent = `Hash rate: 0 H/s`;
        }

        if (obj.user.paid_rewards === 0) {
            speakOutput = `${speakOutput} No Litecoin has been paid out to your wallet.`;
            cardContent = `${cardContent}\nPaid rewards: 0 LTC`;
        }
        else {
            var converted = addCommas(Number(obj.user.paid_rewards * getExchangeRate(obj, currency)).toFixed(2));
            speakOutput = `${speakOutput} You've been paid ${addCommas(obj.user.paid_rewards)} Litecoin or ${converted} ${getCurrencyLongName(currency)}.`;
            cardContent = `${cardContent}\nPaid rewards: ${addCommas(obj.user.paid_rewards)} LTC`;
        }

        if (obj.user.blocks_found === 0) {
            speakOutput = `${speakOutput} You haven't found any blocks yet.`;
            cardContent = `${cardContent}\nBlocks found: 0`;
        }
        else {
            speakOutput = `${speakOutput} You've found ${addCommas(obj.user.blocks_found)} blocks!`;
            cardContent = `${cardContent}\nBlocks found ${addCommas(obj.user.blocks_found)}`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Summary Report', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the CurrentHashRate intent is reached. It outputs the current total hash rate (the sum) for all workers mining in your account.
/// </summary>
const CurrentHashRateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CurrentHashRateIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        // The hash rate is returned as kilohash. Convert it to hash for easy of formatting.
        obj.user.hash_rate = obj.user.hash_rate * 1000;

        // We're making the assumption that the current hash rate will always be returned as kilohash (not formatted in a higher unit of measure).
        // Extra developer points for supporting hash rate units of measurements which are almost certainly unreachable!

        // Format the hash rate as zettahash if it's greather than or equal to one sextillion hash. 
        if (obj.user.hash_rate >= 1000000000000000000000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000000000).toFixed(1))} zettahash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000000000).toFixed(1))} ZH/s.`;
        }

        // Format the hash rate as exahash if it's less than one sextillion hash, but greather than or equal to one quintillion hash. 
        if (obj.user.hash_rate < 1000000000000000000000 && obj.user.hash_rate >= 1000000000000000000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000000).toFixed(1))} exahash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000000).toFixed(1))} EH/s.`;
        }

        // Format the hash rate as petahash if it's less than one quintillion hash, but greather than or equal to one quadrillion hash. 
        if (obj.user.hash_rate < 1000000000000000000 && obj.user.hash_rate >= 1000000000000000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000).toFixed(1))} petahash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000000).toFixed(1))} PH/s.`;
        }

        // Format the hash rate as terahash if it's less than one quadrillion hash, but greather than or equal to one trillion hash. 
        if (obj.user.hash_rate < 1000000000000000 && obj.user.hash_rate >= 1000000000000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000).toFixed(1))} terahash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000000).toFixed(1))} TH/s.`;
        }

        // Format the hash rate as gigahash if it's less than one trillion hash, but greater than or equal to one billion hash. 
        if (obj.user.hash_rate < 1000000000000 && obj.user.hash_rate >= 1000000000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000).toFixed(1))} gigahash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000000).toFixed(1))} GH/s.`;
        }

        // Format the hash rate as megahash if it's less than one billion hash, but greater than or equal to one hundred million hash. 
        if (obj.user.hash_rate < 1000000000 && obj.user.hash_rate >= 100000000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000).toFixed(1))} megahash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000000).toFixed(1))} MH/s.`;
        }

        // Format the hash rate as kilohash if it's less than one hundred million hash, but greater than or equal to one thousand hash. 
        if (obj.user.hash_rate < 100000000 && obj.user.hash_rate >= 1000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000).toFixed(1))} kilohash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate / 1000).toFixed(1))} kH/s.`;
        }

        // Format the hash rate as just hash if it's less than one thousand hash. 
        if (obj.user.hash_rate < 1000) {
            speakOutput = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate).toFixed(1))} hash per second.`;
            cardContent = `Your current hash rate is ${addCommas(Number(obj.user.hash_rate).toFixed(1))} H/s.`;
        }

        if (obj.user.hash_rate === 0) {
            speakOutput = `You don't appear to have any active miners.`;
            cardContent = `You don't appear to have any active miners.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Current Mining Speed', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the BlocksFound intent is reached. It outputs a response indicating how many (if any) blocks you have found.
/// </summary>
const BlocksFoundIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BlocksFoundIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        if (obj.user.blocks_found === 0) {
            speakOutput = `You haven't found any blocks yet.`;
            cardContent = `You haven't found any blocks yet.`;
        }
        else {
            speakOutput = `You've found ${addCommas(obj.user.blocks_found)} blocks!`;
            cardContent = `You've found ${addCommas(obj.user.blocks_found)} blocks!`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Blocks Found', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the PaidOut intent is reached. It outputs the total amount of Litecoin which has been transferred to your wallet.
/// It also converts that amount into whatever local currency has been specified via the 'currency' constant, reporting the total in both LTC and your local currency.
/// </summary>
const PaidOutIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PaidOutIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        if (obj.user.paid_rewards === 0) {
            speakOutput = `No Litecoin has been paid out to your wallet.`;
            cardContent = `No Litecoin has been paid out to your wallet.`;
        }
        else {
            var converted = addCommas(Number(obj.user.paid_rewards * getExchangeRate(obj, currency)).toFixed(2));
            speakOutput = `You've been paid ${addCommas(obj.user.paid_rewards)} Litecoin or ${converted} ${getCurrencyLongName(currency)}.`;
            cardContent = `You've been paid ${addCommas(obj.user.paid_rewards)} LTC or ${getCurrencySymbol(currency)}${converted} ${currency}.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Total Paid Out', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the UnPaidRewards intent is reached. It outputs the total amount of Litecoin which has been rewarded, but not yet transferred to your wallet.
/// It also converts that amount into whatever local currency has been specified via the 'currency' constant, reporting the total in both LTC and your local currency.
/// </summary>
const UnpaidRewardsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UnpaidRewardsIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        if (obj.user.paid_rewards === 0) {
            speakOutput = `There is no Litecoin waiting to paid out to your wallet.`;
            cardContent = `There is no Litecoin waiting to paid out to your wallet.`;
        }
        else {
            var converted = addCommas(Number(obj.user.unpaid_rewards * getExchangeRate(obj, currency)).toFixed(2));
            speakOutput = `${addCommas(Number(obj.user.unpaid_rewards).toFixed(5))} Litecoin or ${converted} ${getCurrencyLongName(currency)} is waiting to be paid out to your wallet.`;
            cardContent = `${addCommas(Number(obj.user.unpaid_rewards).toFixed(5))} LTC or ${getCurrencySymbol(currency)}${converted} ${currency} is waiting to be paid out to your wallet.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Unpaid Rewards', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the RewardsPastDay intent is reached. It outputs the total amount of Litecoin which has been rewarded over the past twenty-four hours.
/// It also converts that amount into whatever local currency has been specified via the 'currency' constant, reporting the total in both LTC and your local currency.
/// </summary>
const RewardsPastDayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RewardsPastDayIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        if (obj.user.past_24h_rewards === 0) {
            speakOutput = `No Litecoin has been rewarded over the past twenty-four hours.`;
            cardContent = `No Litecoin has been rewarded over the past twenty-four hours.`;
        }
        else {
            var converted = addCommas(Number(obj.user.past_24h_rewards * getExchangeRate(obj, currency)).toFixed(2));
            speakOutput = `${addCommas(Number(obj.user.past_24h_rewards).toFixed(5))} Litecoin or ${converted} ${getCurrencyLongName(currency)} has been rewarded over the past twenty-four hours.`;
            cardContent = `${addCommas(Number(obj.user.past_24h_rewards).toFixed(5))} LTC or ${getCurrencySymbol(currency)}${converted} ${currency} has been rewarded over the past twenty-four hours.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Rewards for Past Day', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the ExchangeRate intent is reached. It converts the value of one Litecoin into the specified local currency using the current exchange rate.
/// </summary>
const ExchangeRateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExchangeRateIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let slotresolvedvalue = handlerInput.requestEnvelope.request.intent.slots.currency.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        let obj = JSON.parse(data);

        var converted = addCommas(Number(1 * getExchangeRate(obj, slotresolvedvalue)).toFixed(2));
        speakOutput = `1 Litecoin is currently valued at ${converted} ${getCurrencyLongName(slotresolvedvalue)}.`;
        cardContent = `1 LTC is currently valued at ${getCurrencySymbol(slotresolvedvalue)}${converted} ${slotresolvedvalue}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Exchange Rate', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the TotalWork intent is reached. It outputs the total amount of work completed for all workers mining in your account.
/// </summary>
const TotalWorkIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TotalWorkIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        // We're making the assumption that the total work will always be returned as hash (not formatted in a higher unit of measure).

        // Format the total work as zettahash if it's greather than or equal to one sextillion hash. 
        if (obj.user.total_work >= 1000000000000000000000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000000000000).toFixed(0))} zettahash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000000000000).toFixed(0))} ZH.`;
        }

        // Format the total work as exahash if it's less than one sextillion hash, but greather than or equal to one quintillion hash. 
        if (obj.user.total_work < 1000000000000000000000 && obj.user.total_work >= 1000000000000000000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000000000).toFixed(0))} exahash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000000000).toFixed(0))} EH.`;
        }

        // Format the total work as petahash if it's less than one quintillion hash, but greather than or equal to one quadrillion hash. 
        if (obj.user.total_work < 1000000000000000000 && obj.user.total_work >= 1000000000000000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000000).toFixed(0))} petahash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000000).toFixed(0))} PH.`;
        }

        // Format the total work as terahash if it's less than one quadrillion hash, but greather than or equal to one trillion hash. 
        if (obj.user.total_work < 1000000000000000 && obj.user.total_work >= 1000000000000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000).toFixed(0))} terahash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000000).toFixed(0))} TH.`;
        }

        // Format the total work as gigahash if it's less than one trillion hash, but greater than or equal to one billion hash. 
        if (obj.user.total_work < 1000000000000 && obj.user.total_work >= 1000000000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000).toFixed(0))} gigahash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000000).toFixed(0))} GH.`;
        }

        // Format the total work as megahash if it's less than one billion hash, but greater than or equal to one hundred million hash. 
        if (obj.user.total_work < 1000000000 && obj.user.total_work >= 100000000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000).toFixed(0))} megahash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000000).toFixed(0))} MH.`;
        }

        // Format the total work as kilohash if it's less than one hundred million hash, but greater than or equal to one thousand hash. 
        if (obj.user.total_work < 100000000 && obj.user.total_work >= 1000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work / 1000).toFixed(0))} kilohash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work / 1000).toFixed(0))} kH.`;
        }

        // Format the total work as just hash if it's less than one thousand hash. 
        if (obj.user.total_work < 1000) {
            speakOutput = `Your total work is ${addCommas(Number(obj.user.total_work).toFixed(0))} hash.`;
            cardContent = `Your total work is ${addCommas(Number(obj.user.total_work).toFixed(0))} H.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Total Work', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the CurrentDifficulty intent is reached. It outputs the current Litecoin network mining difficulty rate.
/// </summary>
const CurrentDifficultyIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CurrentDifficultyIntent';
    },
    async handle(handlerInput) {
        const httpsRequestClient = new HttpsRequestClient();
        const dataCall = httpsRequestClient.getData();
        const data = await dataCall;
        var speakOutput;
        var cardContent;

        let obj = JSON.parse(data);

        speakOutput = `The current Litecoin network difficulty is ${addCommas(Number(obj.network.difficulty).toFixed(5))}.`;
        cardContent = `The current Litecoin network difficulty is ${addCommas(Number(obj.network.difficulty).toFixed(5))}.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Current Difficulty', cardContent)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the user asks for help. It lists out different questions the user can ask the skill.
/// </summary>
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        var speakOutput = `You can ask me the following questions about your account at Litecoin pool dot org:`;
        speakOutput = `${speakOutput} What's my current hash rate?`;
        speakOutput = `${speakOutput} How much money have I made?`;
        speakOutput = `${speakOutput} How much money is waiting to be paid out?`;
        speakOutput = `${speakOutput} Have I found any blocks?`;
        speakOutput = `${speakOutput} How much Litecoin did I mine over the past day?`;
        speakOutput = `${speakOutput} What's my total completed work?`;
        speakOutput = `${speakOutput} What's the current mining difficulty?`;
        speakOutput = `${speakOutput} And... you can ask me to convert litecoin into U.S dollars, Euro, British pounds, Canadian dollars, Australian dollars, Russian roubles, Chinese yuan, or South African rand.`;
        speakOutput = `${speakOutput} What would you like to know?`;

        var cardContent = `• Current hash rate`;
        cardContent = `${cardContent}\n• Paid rewards`;
        cardContent = `${cardContent}\n• Unpaid rewards`;
        cardContent = `${cardContent}\n• Blocks found`;
        cardContent = `${cardContent}\n• Rewards for past day`;
        cardContent = `${cardContent}\n• Total work`;
        cardContent = `${cardContent}\n• Current difficulty`;
        cardContent = `${cardContent}\n• Currency conversion`;
        cardContent = `${cardContent}\n\nWhat would you like to know?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Help', cardContent)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the user asks to cancel or stop the skill.
/// </summary>
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Exiting Litecoin pool skill. Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/// <summary>
/// This handler is called as the users skill session is ending.
/// </summary>
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, something went wrong. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/// <summary>
/// This function splits a string of numbers, inserting commas where appropriate to make the the number easier to read, and returns the formatted string.
/// </summary>
/// <param name="nStr">A string of numbers to add commas to.</param>
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1 + x2;
}

/// <summary>
/// This function looks up and returns the exchange rate for the specified local currency in the provided JSON data object.
/// </summary>
/// <param name="obj">A JSON data object acquired from litecoinpool.org via an https GET request.</param>
/// <param name="currency">The local currency for which to obtain the exchange rate.</param>
function getExchangeRate(obj, currency) {
    switch (currency) {
        case 'USD':
        default:
            return obj.market.ltc_usd;

        case 'CAD':
            return obj.market.ltc_cad;

        case 'EUR':
            return obj.market.ltc_eur;

        case 'GBP':
            return obj.market.ltc_gbp;

        case 'RUB':
            return obj.market.ltc_rub;

        case 'CNY':
            return obj.market.ltc_cny;

        case 'AUD':
            return obj.market.ltc_aud;

        case 'ZAR':
            return obj.market.ltc_zar;
    }
}

/// <summary>
/// This function converts the three letter acronym for a specified local currency into the written long-form name of the currency and returns that string.
/// </summary>
/// <param name="currency">The local currency to convert to a written long-form name.</param>
function getCurrencyLongName(currency) {
    switch (currency) {
        case 'USD':
        default:
            return 'U.S. dollars';

        case 'CAD':
            return 'Canadian dollars';

        case 'EUR':
            return 'Euro';

        case 'GBP':
            return 'pounds';

        case 'RUB':
            return 'Russian roubles';

        case 'CNY':
            return 'yuan';

        case 'AUD':
            return 'Australian dollars';

        case 'ZAR':
            return 'rand';
    }
}

/// <summary>
/// This function looks up and returns the currency symbol for the specified local currency.
/// </summary>
/// <param name="currency">The local currency to for which to obtain the currency symbol.</param>
function getCurrencySymbol(currency) {
    switch (currency) {
        case 'USD':
        case 'CAD':
        case 'AUD':
        default:
            return '$';

        case 'EUR':
            return '€';

        case 'GBP':
            return '£';

        case 'RUB':
            return '₽';

        case 'CNY':
            return '¥';

        case 'ZAR':
            return 'R';
    }
}

/// <summary>
/// This SkillBuilder is the entry point for the skill, routing requests and response payloads to the appropriate handlers. Each handler is processed in order (top to bottom).
/// </summary>
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CurrentHashRateIntentHandler,
        BlocksFoundIntentHandler,
        PaidOutIntentHandler,
        UnpaidRewardsIntentHandler,
        RewardsPastDayIntentHandler,
        ExchangeRateIntentHandler,
        TotalWorkIntentHandler,
        CurrentDifficultyIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
