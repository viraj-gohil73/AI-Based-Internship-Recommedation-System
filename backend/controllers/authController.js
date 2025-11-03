import Student from "../models/Student.js";
import bcrypt from "bcryptjs";

export const registerStudent = async (req, res) => {
    
    
        const { email, password, role } = req.body;
        console.log(email,password,role)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Student.create({ email, password: hashedPassword });
        if(user){  
        res.status(200).json({ success:true,message: "Registration successfully" });
        }else{
         res.status(400).json({ success:false,message: "Registration failed" });
        }
    
};