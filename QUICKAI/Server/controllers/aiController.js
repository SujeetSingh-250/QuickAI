import OpenAI from 'openai'
import sql from '../config/db.js';
import { clerkClient } from '@clerk/express';
import axios from 'axios';

//gemni
const AI = new OpenAI({
    apiKey:process.env.GEM_API_KEY,
    baseURL:"https://generativelanguage.googleapis.com/v1beta/openai/"
});



// Generate article
export const generateArticle = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt, length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 20){
            return res.json({ success: false, message: 'Free usage limit reached. Upgrade to continue.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        await sql `INSERT INTO creations (user_id, prompt, content,type) 
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        res.json({ success: true, content });


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};


// Generate blog title
export const generateBlogTitle = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 15){
            return res.json({ success: false, message: 'Free usage limit reached. Upgrade to continue.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content;

        await sql `INSERT INTO creations (user_id, prompt, content,type) 
        VALUES (${userId}, ${prompt}, ${content}, 'blog_title')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        res.json({ success: true, content });


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};


export const generateImage = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        // yadi sirf  premium ke liye rakhna hai to is line ko comment kar do
        // const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 20){
            return res.json({ success: false, 
                message: 'This feature is only available for premium users.' 
            });
        }

       // we can use clip drop api for generate images 
        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
             headers: {
                'x-api-key':process.env.CLIPDROP_API_KEY, // replace with your actual API key
                responseType: 'arraybuffer',
             }
         });    

        const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`




        // const response = await AI.chat.completions.create({
        //     model: "gemini-2.0-flash",
        //     messages: [
        //         {
        //             role: "user",
        //             content: prompt,
        //         },
        //     ],
        //     temperature: 0.7,
        //     max_tokens: length,
        // });

        // const content = response.choices[0].message.content;

        await sql `INSERT INTO creations (user_id, prompt, content,type) 
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        res.json({ success: true, content });


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};