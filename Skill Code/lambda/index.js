/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const AWS = require('aws-sdk');

const i18n = require('i18next');
const languageStrings = require('./languageStrings');

const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        
    const attributesManager = handlerInput.attributesManager;
    
    const lastNice = await attributesManager.getPersistentAttributes() || {};
    console.log('lastNice is：', lastNice);
    
    const nice =lastNice.hasOwnProperty('nice')? lastNice.nice : undefined;
    //const nice = niceDynamodb;
    
    if(nice === undefined){
        const speakOutput = '今日のいいことへようこそ。今日いちにちのいいことを思い出すと、幸せな気持ちになれますよ。今日あったいいことを教えてもらえますか？';
    

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    } else{
        const speakOutput = `今日のいいことへようこそ。この前のいいことは<break time ='0.3s'/>${nice}でしたね？今日あったいいことを教えてもらえますか？`;
    

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        
    }
    
    
    }
};

const GoodThingsIntentHandler = {
    canHandle(handlerInput) {
        //新しく加えたところ
        //const request = handlerInput.requestEnvelope.request;
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GoodThingsIntent';
    },
    
    
    async handle(handlerInput) {
        
        const attributesManager =  handlerInput.attributesManager;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        /*新しく加えた箇所
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const randomFact = requestAttributes.t('FACTS');
       ここまで */
        
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        
        //let todayNice = handlerInput.requestEnvelope.request.intent.nice.todayNice.value;
        
        let lastNice = await attributesManager.getPersistentAttributes() || {};
    　　console.log('lastNice is：', lastNice);
    　　
    　　const todayNiceDynamodb = lastNice.hasOwnProperty('nice')? lastNice.nice : undefined;
    　　
    　　let nice = slots.nice.value ||attributes.nice || todayNiceDynamodb;
    　　
    　　
    　　attributes.nice = nice;
            handlerInput.attributesManager.setSessionAttributes(attributes);
            
         lastNice = {"nice":nice};
        attributesManager.setPersistentAttributes(lastNice);
         await attributesManager.savePersistentAttributes();   
            
        
         const makeStateSpeach =()=>{
             const ReturnStrArr = [
                'それは、よかったですね。',
                'いいことがありましたね。',
                'いいことがあると、気分も良くなりますね？',
                'いいことを聞けて、私もうれしいです。',
                '明日も、いいことがありますように？。',
                '明日も、きっと、いいことがありますよ？',
            ];
            let num = Math.floor(Math.random()*ReturnStrArr.length);
            return `そうなんですね？今日あった<break time = '0.1s'/>いいことは<break time = '0.5s'/>${nice}<break time = '0.8s'/>` +  ReturnStrArr[num]+'それでは、よい,くつろぎの時間をお過ごしくださいね？';
         }
         /*let FACTS = 
            
         const randomFact = (FACTS); */
         
            
        const speakOutput = makeStateSpeach() ;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = '今日あったいいことを言うと、あなたが言ったことを繰り返しますよ。今日あったいいことを教えて言ってもらえますか？';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'じゃあ、またね？';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'ごめんなさい。うまくききとれませんでした。終わりたいときは「おしまい」と言ってください。どうしますか？';
        const reprompt = 'どうしますか？';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `さようなら`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = '申し訳ありませんが、エラーが発生しました。';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GoodThingsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: 'f48487c0-58df-41ef-8888-a4121b328c7f',
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: 
            process.env.DYNAMODB_PERSISTENCE_REGION})
        })
    )    
    .lambda();