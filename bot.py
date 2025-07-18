from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Updater, CommandHandler, CallbackContext

def start(update: Update, context: CallbackContext):
    keyboard = [
        [InlineKeyboardButton("🚀 Запустити Ukraine Coin", url="https://funcube-fun.github.io/my-tappalka/")],
        [InlineKeyboardButton("🤖 Запустити Trading Bot", url="https://example.com/trading-bot")],
        [InlineKeyboardButton("📜 Політика конфіденційності", url="https://example.com/privacy")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    welcome_text = (
        "🇺🇦 Ukraine Coin — твій квиток у світ вільної економіки!\n\n"
        "Обирай свій шлях нижче 👇"
    )

    update.message.reply_text(welcome_text, reply_markup=reply_markup)

def main():
    updater = Updater("8118962357:AAH496UA5I1xE41sErwOTCvw-PA3OYZmg9w", use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))

    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
