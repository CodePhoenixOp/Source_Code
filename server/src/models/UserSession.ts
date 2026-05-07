// models/UserSession.ts
// @ts-nocheck
import mongoose from "mongoose"

const userSessionSchema = new mongoose.Schema({
    
})

const UserSession = mongoose.model("UserSession", userSessionSchema) as any;
export default UserSession;