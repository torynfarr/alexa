# Alexa
This repository contains sample skills designed for Alexa, Amazon's voice assistant.
<br />
<br />

## 01.[Litecoin Pool Mining Stats](https://github.com/torynfarr/alexa/tree/master/01.litecoin-pool-mining-stats)
<br />
<img src="https://github.com/torynfarr/alexa/blob/master/docs/images/litecoin-pool-mining-stats.png" height=100 width=87.5>
<br />
This sample skill sends an https GET request to the REST API at litecoinpool.org to obtain various cryptocurrency mining stats for the target account. It includes eight intents which can be reached by invoking the skill as follows:
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

<br />
<br />

## 02.[Washing Your Hands](https://github.com/torynfarr/alexa/tree/master/02.washing-your-hands)
<br />
<img src="https://github.com/torynfarr/alexa/blob/master/docs/images/washing-your-hands.png" height=100 width=87.5>
<br />
With the world currently facing the COVID-19 pandemic, health organizations such as the CDC in the United States are trying to make sure people wash their hands for a full twenty-seconds. One of their suggestions was that people sing the Happy Birthday song two times while washing their hands. This sample skill takes a more modern approach! Invoke the skill by saying *"Alexa, start washing hands."

Alexa will instruct you to start washing your hands using a soap dispenser positioned to the left of your sink. After twenty-seconds have passed, she'll let you know that you can rinse and dry off your hands. She'll then ask if you've just come in from being outside. If you respond by saying *"No"* then you're done. If you say *"Yes,"* she'll direct you to use a Purell dispenser positioned to the right of your sink. Again, after twenty-seconds have passed, she'll let you know that you can dry off your hands and that they are now clean and sanitized.

There are two mp3 files that will need to be hosted in a publically accessible location. The skill uses these for a twenty-second and five-second delay.

## Additional Information

- These skills were created as Alexa-Hosted (Node.js) within the AWS Free Tier limits.
- Opening an Amazon Web Services (AWS) account is not required.
- An Amazon developer account is required.