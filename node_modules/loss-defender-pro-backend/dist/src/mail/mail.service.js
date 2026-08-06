"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
let MailService = MailService_1 = class MailService {
    constructor() {
        this.log = new common_1.Logger(MailService_1.name);
    }
    async send(to, subject, text) {
        const host = process.env.SMTP_HOST;
        if (!host) {
            this.log.warn(`[DEV MAIL] to=${to} subject=${subject}\n${text}`);
            return { mock: true };
        }
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                host,
                port: Number(process.env.SMTP_PORT ?? 587),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            await transporter.sendMail({
                from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
                to,
                subject,
                text,
            });
            return { mock: false };
        }
        catch (e) {
            this.log.error(`Mail failed: ${e?.message}`);
            this.log.warn(`[FALLBACK DEV MAIL] to=${to}\n${text}`);
            return { mock: true };
        }
    }
    otpEmail(purpose, code) {
        return `Your Loss Defender Pro code for ${purpose} is: ${code}\nValid for 15 minutes.`;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map