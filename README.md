# Alexa
This repository contains sample skills designed for Alexa, Amazon's voice assistant.
<br />
<br />

## 01.[Litecoin Pool Mining Stats](https://github.com/torynfarr/alexa/tree/master/01.litecoin-pool-mining-stats)
<br />
<img src="https://github.com/torynfarr/alexa/blob/master/docs/images/litecoin-pool-mining-stats.png" height=100 width=87.5>
<br />
This sample sends an https GET request to the REST API at litecoinpool.org to obtain various cryptocurrency mining stats for the target account. It includes eight intents which can be reached by invoking the skill as follows:
<br />
<br />

*"Alexa, ask Litecoin Pool..."*

- *for my current hash rate.*

- *how much money I've made.* 

- *if  I've found any blocks.*

- *for my unpaid rewards.*

- *for my rewards over the past day.*

- *for my total work.*

- *for the current network difficulty.*

- *to convert Litecoin to <'currency'>*

The supported currencies include:  U.S. dollars, Canadian dollars, euro, British pounds, Australian dollars, Russian roubles, yuan, and South African rand.

The currency conversion (*ExchangeRate*) intent provides an example of using a custom slot which supports canonical names and multiple aliases.

The skill features a summary report which is reachable by simply saying *"Alexa, open Litecoin Pool."*, without including an initial utterance.

Lastly, you can say *"Alexa, ask Litecoin Pool for help."* to hear a list of the questions you can ask the skill.

## Additional Information

- These skills were created as Alexa-Hosted (Node.js) within the AWS Free Tier limits.
- Opening an Amazon Web Services (AWS) account is not required.
- An Amazon developer account is required.