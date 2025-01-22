import type { FastifyReply, FastifyRequest } from "fastify";
import otpHelper from "../helpers/otpHelper";
import * as smsService from "../services/smsService";

//TODO: Store OTPs in Radis
const otpStore: Record<string, string> = {};

export const sendOtp = async (
  request: FastifyRequest<{ Querystring: { phone: string } }>,
  reply: FastifyReply
) => {
  const { phone } = request.query;

  if (!phone) {
    return reply.status(400).send({ error: "Phone number is required" });
  }

  // Generate OTP and store it
  const otp = otpHelper.generateOtp();
  otpStore[phone] = otp;

  // Send OTP
  smsService.sendOTP(phone, otp);
  reply.send({ message: "OTP sent successfully (logged for now)" });
};

export const verifyOtp = async (
  request: FastifyRequest<{ Body: { phone: string; otp: string } }>,
  reply: FastifyReply
) => {
  const { phone, otp } = request.body;

  if (!phone || !otp) {
    return reply.status(400).send({ error: "Phone and OTP are required" });
  }

  // Validate OTP
  if (otpStore[phone] && otpStore[phone] === otp) {
    delete otpStore[phone]; // Remove OTP after successful verification
    return reply.send({ message: "OTP verified successfully" });
  }

  reply.status(400).send({ error: "Invalid OTP" });
};