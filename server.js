import dotenv from "dotenv"
dotenv.config()

import chalk from 'chalk';


// text file 
import fs from "fs/promises"
async function readTextFile() {
    const data = await fs.readFile("text.txt", 'utf8')
    return data
}
async function writeTextFile(content) {
    await fs.writeFile("translated_text.txt", content, 'utf8');
    console.log('written into file');
}



// openai
import OpenAI from 'openai'

const openai_key = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey: openai_key })

async function chatgpt(text, instructions) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'user', content: text },
            { role: 'system', content: instructions },
        ],
        //temperature: 0.1,
        //top_p: 0.3,
        // frequency_penalty: 0.0,
        // presence_penalty: 0.0,
    })
       console.log(`\nTokens prompted: ${response.usage.prompt_tokens};\nTokens for completion: ${response.usage.completion_tokens};\nTokens in total: ${response.usage.total_tokens}\n`)
    return response.choices[0].message.content
}


// deepl 
import * as deepl from 'deepl-node';

const deepl_key = process.env.DEEPL_API_KEY
const translator = new deepl.Translator(deepl_key);

async function translate(text) {
    const result = await translator.translateText(text, null, 'en-GB'); // TODO: language to translate in here
    return result.text
}


async function finalTranslation() {
    try {
        const textToTranslate = await readTextFile()

        const translation = await translate(textToTranslate);
        console.log(chalk.green.bgWhite.bold('\n\nTranslation:\n'), translation);
        

        const gptcheck = await chatgpt(`I will send a japanese and an english text. Translated from japanese: ${textToTranslate} to english: ${translation}`, 'This is a translation from japanese to english. Grade the translation from 0 to 100. No other output is allowed.');
        console.log(chalk.green.bgWhite.bold('\nGPT Graded this translation:'), gptcheck);

        if (gptcheck > 96) {
            console.log('\nemailing this wonder!\n\n\n')
            await writeTextFile(translation)
        } else {
            const gptcheck = await chatgpt(`Since this translations was not so good I'd like you to fix it, this is the japanese text: ${textToTranslate}, and this is the output generated from deepl: ${translation}`, 'Only output the fixed and high quality version of the translation as if you were the translator of that japanese text');
            console.log(chalk.green.red.bold('\nFixed from GPT:'), gptcheck);
            await writeTextFile(gptcheck)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

finalTranslation();
