import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Имэйл хаяг буруу байна" }),
  password: z
    .string()
    .min(8, { message: "Нууц үг хамгийн багадаа 8 тэмдэгттэй байх ёстой" })
    .regex(/[A-Z]/, { message: "Дор хаяж 1 том үсэг агуулсан байх ёстой" })
    .regex(/[a-z]/, { message: "Дор хаяж 1 жижиг үсэг агуулсан байх ёстой" })
    .regex(/[0-9]/, { message: "Дор хаяж 1 тоо агуулсан байх ёстой" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Дор хаяж 1 тусгай тэмдэгт (!@#$%^&* гэх мэт) агуулсан байх ёстой",
    }),
});