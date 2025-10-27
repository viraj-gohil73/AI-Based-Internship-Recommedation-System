import Student from "../models/Student.js";
import bcrypt from "bcryptjs";

export const registerStudent = async (req, res) => {
    
    try {
        const { email, password, fname, lname } = req.body;

        const userExists = await Student.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Student.create({ email, password: hashedPassword,fname, lname });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
};