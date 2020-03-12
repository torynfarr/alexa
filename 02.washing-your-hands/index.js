// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const SILENCE_05_SEC = "<audio src=\"INSERT-URL-TO-silience-050-sec.mp3\" />";
const SILENCE_20_SEC = "<audio src=\"INSERT-URL-TO-silence-20-sec.mp3\" />";

/// <summary>
/// This handler is called then the skill is opened without the user including an initial utterance (by just saying 'Alexa, open washing your hands').
/// Ideally, a routine will be created in the Alexa app to open this skill using an alternative phrase such as 'Alexa, I'm washing my hands.'
/// </summary>
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        var speakOutput = 'Please use the soap dispenser to the left of the sink.';
        var cardContent = 'Please use the soap dispenser on the left.';
        speakOutput = `${speakOutput} After twenty seconds, I'll let you know that it's time to rinse and dry off your hands.` + SILENCE_20_SEC + "You may now rinse off and dry your hands." + SILENCE_05_SEC + SILENCE_05_SEC;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Washing Your Hands', cardContent)
            .addDelegateDirective({
                name: 'WasOutsideIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the WasOutside intent is reached. The LaunchRequestHandler directs to this intent to prompt the user, asking if they just came in from the outside.
/// </summary>
const WasOutsideIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WasOutsideIntent';
    },
    handle(handlerInput) {
        var speakOutput;
        var cardContent;
        
        let slotresolvedvalue = handlerInput.requestEnvelope.request.intent.slots.yesno.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      
        if (slotresolvedvalue === 'yes'){
            speakOutput = 'Please use the Purell dispenser to the right of the sink.';
            cardContent = 'Please use the Purell dispenser on the right.';
            speakOutput = `${speakOutput} After twenty seconds, I'll let you know that it's time to dry off your hands.` + SILENCE_20_SEC;
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withSimpleCard('Sanitizing Your Hands', cardContent)
                .addDelegateDirective({
                    name: 'PurellWasNeededIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                })
                .withShouldEndSession(true)
                .getResponse();
        }
        
        if (slotresolvedvalue === 'no') {
            speakOutput = 'Your hands are now clean.';
            cardContent = 'Your hands are now clean.';
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withSimpleCard('Finished', cardContent)
                .withShouldEndSession(true)
                .getResponse();
        }
    }
};

/// <summary>
/// This handler is called when the PurellWasNeededIntent intent is reached. The WasOutsideIntentHandler directs to this intent if the user indicates that they just came in from the outside.
/// </summary>
const PurellWasNeededIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PurellWasNeededIntent';
    },
    handle(handlerInput) {
        var speakOutput = 'You may now dry off your hands. Your hands are now clean and sanitized.';
        var cardContent = 'Your hands are now clean and sanitized.';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard('Finished', cardContent)
            .withShouldEndSession(true)
            .getResponse();
    }
};

/// <summary>
/// This handler is called when the user asks for help. It explains what the skill does.
/// </summary>
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        var speakOutput = `This skill has been designed to help promote proper hygiene by making sure that you wash your hands for an appropriate duration of time.`;
        speakOutput = `${speakOutput} Just open the skill and I will direct you to use the soap dispenser on the left side of your sink.`;
        speakOutput = `${speakOutput} After twenty seconds, I'll let you know that it's time to rinse off your hands.`;
        speakOutput = `${speakOutput} I'll then ask you if you've just come in from the outside.`;
        speakOutput = `${speakOutput} If you have, I'll direct you to use the Purell dispense on the right side of your sink.`;
        speakOutput = `${speakOutput} And again, after twenty seconds, I'll let you know that it's time to rinse off your hands.`;
        speakOutput = `${speakOutput} Together, we can help keep you healthy and avoid catching the Corona virus.`;
        
        var cardContent = `This skill has been designed to help promote proper hygiene by making sure that you wash your hands for an appropriate duration of time.`;
        cardContent = `${cardContent}\n\nTogether, we can help keep you healthy and avoid catching the Corona virus.`;

        
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
        const speakOutput = 'Exiting washing your hands skill. Stay healthy! Goodbye!';
        
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
/// This SkillBuilder is the entry point for the skill, routing requests and response payloads to the appropriate handlers. Each handler is processed in order (top to bottom).
/// </summary>
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        WasOutsideIntentHandler,
        PurellWasNeededIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
