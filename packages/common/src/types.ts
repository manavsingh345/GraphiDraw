import { z } from "zod";

export const CreateUserSchema=z.object({
    username:z.string().min(3, "Username too short").max(30,"Username is too long"),
    password:z.string().min(4,"Password too short"),
    name:z.string()
});

export const SigninSchema=z.object({
    username:z.string().min(3).max(30),
    password:z.string().min(4)
});

export const CreateRoomSchema=z.object({
    name:z.string().min(3,"Name too short").max(30,"Name too long")
})