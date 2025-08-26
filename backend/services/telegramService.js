import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramService {
    constructor() {
        this.botToken = TELEGRAM_BOT_TOKEN;
        this.chatId = TELEGRAM_CHAT_ID;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    /**
     * Send a message to Telegram
     */
    async sendMessage(message) {
        try {
            const response = await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            });

            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(`Telegram API Error: ${data.description}`);
            }

            return { success: true, messageId: data.result.message_id };
        } catch (error) {
            // Don't throw error to prevent payment flow disruption
            if (process.env.NODE_ENV !== 'production') {
                console.error('Telegram notification failed:', error.message);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Format payment notification message
     */
    formatPaymentMessage(paymentData) {
        const {
            transactionId,
            username,
            amount,
            method,
            status,
            timestamp,
            userId,
            userDetails = {}
        } = paymentData;

        const methodNames = {
            'card': '💳 Card to Card',
            'mpay': '📱 Auto Mpay',
            'visa': '💳 Visa/Mastercard',
            'm10': '📱 Auto M10'
        };

        const statusEmojis = {
            'pending': '⏳',
            'completed': '✅',
            'failed': '❌',
            'processing': '🔄'
        };

        const methodName = methodNames[method] || `💰 ${method.toUpperCase()}`;
        const statusEmoji = statusEmojis[status] || '❓';

        let message = `🔔 <b>YENİ ÖDEME BİLDİRİMİ</b>\n\n`;
        message += `${statusEmoji} <b>Durum:</b> ${status.toUpperCase()}\n`;
        message += `💰 <b>Tutar:</b> ${amount} AZN\n`;
        message += `${methodName}\n`;
        message += `👤 <b>Kullanıcı:</b> ${username}\n`;
        
        if (userDetails.name || userDetails.surname) {
            message += `📝 <b>Ad Soyad:</b> ${userDetails.name || ''} ${userDetails.surname || ''}\n`;
        }
        
        if (userDetails.email) {
            message += `✉️ <b>Email:</b> ${userDetails.email}\n`;
        }
        
        if (userDetails.mobile) {
            message += `📞 <b>Telefon:</b> ${userDetails.mobile}\n`;
        }

        message += `🆔 <b>İşlem ID:</b> <code>${transactionId}</code>\n`;
        message += `👤 <b>Kullanıcı ID:</b> ${userId}\n`;
        message += `⏰ <b>Tarih:</b> ${new Date(timestamp).toLocaleString('tr-TR', {
            timeZone: 'Asia/Baku',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}\n`;
        
        message += `\n<b>💻 betbuta1318.com</b>`;

        return message;
    }

    /**
     * Send payment notification
     */
    async sendPaymentNotification(paymentData) {
        try {
            const message = this.formatPaymentMessage(paymentData);
            return await this.sendMessage(message);
        } catch (error) {
            // Don't throw error to prevent payment flow disruption
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to send payment notification:', error.message);
            }
            return { success: false, error: error.message };
        }
    }


    /**
     * Send balance update notification
     */
    async sendBalanceUpdateNotification(balanceData) {
        try {
            const { username, userId, oldBalance, newBalance, amount, type, timestamp } = balanceData;
            
            const typeEmojis = {
                'deposit': '⬆️',
                'withdrawal': '⬇️',
                'bonus': '🎁',
                'adjustment': '⚖️'
            };

            const emoji = typeEmojis[type] || '💰';
            
            let message = `${emoji} <b>BAKİYE GÜNCELLEMESİ</b>\n\n`;
            message += `👤 <b>Kullanıcı:</b> ${username}\n`;
            message += `🆔 <b>Kullanıcı ID:</b> ${userId}\n`;
            message += `💰 <b>Eski Bakiye:</b> ${oldBalance} AZN\n`;
            message += `💰 <b>Yeni Bakiye:</b> ${newBalance} AZN\n`;
            message += `📊 <b>Değişim:</b> ${amount > 0 ? '+' : ''}${amount} AZN\n`;
            message += `📋 <b>Tip:</b> ${type.toUpperCase()}\n`;
            message += `⏰ <b>Tarih:</b> ${new Date(timestamp).toLocaleString('tr-TR', {
                timeZone: 'Asia/Baku',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}\n`;
            
            message += `\n<b>💻 betbuta1318.com</b>`;

            return await this.sendMessage(message);
        } catch (error) {
            // Don't throw error to prevent balance update flow disruption
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to send balance update notification:', error.message);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Test telegram connection
     */
    async testConnection() {
        try {
            const testMessage = `🧪 <b>TEST MESAJI</b>\n\nTelegram botu başarıyla yapılandırıldı!\n⏰ ${new Date().toLocaleString('tr-TR', { timeZone: 'Asia/Baku' })}\n\n<b>💻 betbuta1318.com</b>`;
            return await this.sendMessage(testMessage);
        } catch (error) {
            throw new Error(`Telegram connection test failed: ${error.message}`);
        }
    }
}

export default new TelegramService();