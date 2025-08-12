import { clerkClient } from "@clerk/express";

// middle to check userId and has premium plan
export const auth = async (req, res, next) => {
     try {
        const {userId,has} = await req.auth();
        const hasPremiumPlan = has({plan:'premium'});

        const user = await clerkClient.users.getUser(userId);
        if(!hasPremiumPlan && user.privateMetadata.free_usage){
            req.free_usage = user.privateMetadata.free_usage;
        }
        else{
            clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next()
     } catch (error) {
        res.json({ success: false, message: error.message });
     }
};


