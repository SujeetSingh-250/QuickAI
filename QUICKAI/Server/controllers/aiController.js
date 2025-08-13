import OpenAI from 'openai'
import sql from '../config/db.js';
import { clerkClient } from '@clerk/express';
import axios from 'axios';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

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

// Generate image
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        // yadi sirf  premium ke liye rakhna hai to is line ko comment kar do
        // const free_usage = req.free_usage;
        // if(plan !== 'premium' && free_usage >= 20){
        //     return res.json({ success: false, 
        //         message: 'This feature is only available for premium users.' 
        //     });
        // }

        // for premium
        if (plan !== 'premium') {
            return res.json({
            success: false,
            message: 'This feature is only available for premium users.'
        });
        }

       // we can use clip drop api for generate images 
        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers:{'x-api-key':process.env.CLIPDROP_API_KEY,},
            responseType: 'arraybuffer'
         });    

        const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64').toString('base64')}`;
            // Upload to Cloudinary
        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            resource_type: 'image'
        });

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

        await sql `INSERT INTO creations (user_id, prompt, content,type, publish) 
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;


        res.json({ success: true, content: secure_url });


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};

//Background image removal
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {image} = req.file
        const plan = req.plan;

        // for premium
        if (plan !== 'premium') {
            return res.json({
            success: false,
            message: 'This feature is only available for premium users.'
        });
        }

    

        // Upload to Cloudinary
        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation:[
                {
                    effect:'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        });


        await sql `INSERT INTO creations (user_id, prompt, content,type) 
        VALUES (${userId}, 'remove background from image', ${secure_url}, 'image' )`;


        res.json({ success: true, content: secure_url });


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};


// Background object removal
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {object} = req.body;
        const {image} = req.file;
        const plan = req.plan;

        // for premium
        if (plan !== 'premium') {
            return res.json({
            success: false,
            message: 'This feature is only available for premium users.'
        });
        }

    

        // Upload to Cloudinary
        const { public_id } = await cloudinary.uploader.upload(image.path);
        const imageUrl =cloudinary.url(public_id,{
            transformation:[{effect:`gen_remove:${object}`}],
            resource_type: 'image'
        });

        await sql `INSERT INTO creations (user_id, prompt, content,type) 
        VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image' )`;


        res.json({ success: true, content: imageUrl });


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};

//Review resume

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file
        const plan = req.plan;

        // for premium
        if (plan !== 'premium') {
            return res.json({
            success: false,
            message: 'This feature is only available for premium users.'
        });
        }

        if(resume.size > 5*1024*1024){
            return res.json({
                success: false,
                message: 'File size exceeds 5MB limit.'
            });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);
        const prompt = `review the following resume and provide consttructive 
        feedback on it's strengths, weakness, and areas for improvement.
        Resume Content:\n\n${pdfData.text}  `

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens:1000,
        });

        const content = response.choices[0].message.content;

        await sql `INSERT INTO creations (user_id, prompt, content,type) 
        VALUES (${userId}, 'review the uploaded resume', ${content}, 'resume-review' )`;


        res.json({ success: true, content});


    } catch (error) {
        console.error(error.message);
        // res.status(500).json({ success: false, message: error.message });
        res.json({success:false, message:error.message})
    }
};