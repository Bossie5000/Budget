# Monthly Budget Tracker 💰

A web-based budget tracker for managing your monthly finances: income, expenses, optional fuel advance tracking, and account balances. Runs entirely in the browser (pure HTML/CSS/JavaScript, no frameworks or build step) and can optionally sync to a private GitHub repo so the same data is on all your devices.

The whole app is one file: **`index.html`**.

## 🌟 Features

- **Income**: track multiple income sources per month
- **Expenses**: Fixed, Flexible, Subscriptions, International Bank Fees and Ad Hoc
  - Fixed, Flexible and Subscriptions are carried over to the next month (unpaid again)
- **Fuel advance** (optional): track a fuel advance, purchases and how much is left to return. Turn it on or off in **Settings**
- **Accounts**: credit and savings balances
- **Summary**: income, expenses, current/projected balance and a balance checker
- **Multi-month**: switch months, add a month, or jump to the next one
- **Light and dark mode**
- **GitHub sync** between devices (optional)
- **Import / Export** to a JSON file

Dates are shown as **dd/mm/yyyy** and months as **mm/yyyy**. You can type a date (slashes are added for you) or pick it from the calendar button.

## 🚀 Live demo

Visit the live application: [Your GitHub Pages URL]

## 💻 Usage

**Online:** open the live link above. No installation needed.

**Locally:** download or clone this repository and open `index.html` in a browser.

## 📖 How to use

1. **Pick or add a month** with the month selector, **New Month** (type `MM/YYYY`) or **Next Month**
2. **Income**: add your income sources
3. **Expenses**: add and manage expenses in each category tab. Select a row, then Edit, Delete or Toggle Paid
4. **Fuel** (if enabled): set the advance and log fuel purchases
5. **Accounts**: update your credit and savings balances
6. **Summary**: see the totals and use the Balance Checker to compare against your real bank balance

The sections appear in this order: Summary, Income, Expenses, Fuel (only if enabled), Accounts.

### Turning fuel tracking on or off

Open **⚙ Settings** and use **Enable fuel tracking**.

- **Off:** the Fuel section, the fuel figures on the Summary and the True Available Balance card are hidden. Fuel data is **kept**, not deleted.
- **On:** everything comes back exactly as it was.
- Existing data is detected automatically: if a data file already has fuel data, fuel is on; if it has none, fuel is off. Once you flip the switch, your choice is remembered.
- The setting is stored in your data file, so it syncs. Use a separate data file per person (see below) and each person has their own setting.

### Light / dark mode

Use the 🌓 button (sidebar on desktop, top bar on mobile) or **Settings → Appearance**. The choice is saved per device.

## ☁ GitHub sync (optional)

Keep the app in a **public** repo (so GitHub Pages works) and save your data to a separate **private** repo.

1. Create a private repo for data, e.g. `budget-data`
2. Create a personal access token with the `repo` scope: <https://github.com/settings/tokens/new>
3. In the app open **⚙ Settings → GitHub sync** and enter your username, the data repo, a filename (unique per person, e.g. `data_john.json`) and the token
4. Click **Save & Sync**

### How syncing works

Every month carries an `updated_at` time that is set whenever you edit it. When the app syncs it compares your data with the file on GitHub, month by month, and **the most recently edited copy always wins**:

| Situation | What happens |
|---|---|
| Nothing changed | Nothing is sent. Shows "Up to date" |
| Only you changed something | Pushed to GitHub |
| Only GitHub changed | Pulled to this device |
| Both changed | Merged month by month (newer wins), then pushed |

- **Sync Now** does all of the above in both directions. The sidebar status (and a pop-up message) says what actually happened, e.g. "Pulled 1 change".
- The app also syncs on start, about 1.5 seconds after each edit, when you return to the app, and when the network comes back.
- Only one sync runs at a time. Edits made during a sync are sent in one follow-up sync.
- If a sync fails, the reason is shown (hover the status in the sidebar, or see the pop-up), for example a rejected token or being offline.
- The selected month is **per device** and is not synced.
- Limits: the merge works per month, so if two devices edit the *same month* before syncing, the whole month from the newer edit wins. Device clocks should be correct (phones normally are).
- If the file on GitHub is not valid JSON, the app refuses to overwrite it.

## 💾 Data and privacy

Data is stored in your browser's local storage. **Nothing is sent anywhere unless you set up GitHub sync**, and then it only goes to your own private repo using your token. The token is stored in this browser only.

Use **Export** to save a backup JSON file and **Import** to restore it. An import replaces the data on this device and (if sync is on) becomes the newest version.

## 🛠️ Technical details

- Pure HTML/CSS/JavaScript, single file
- `localStorage` for persistence, GitHub Contents API for sync
- Dates stored as `yyyy-mm-dd` and months as `yyyy-mm` (display formatting only changes how they look)
- Responsive: sidebar on desktop, bottom navigation bar on mobile

## 📱 Browser compatibility

Modern browsers: Chrome/Edge, Firefox, Safari, Opera.

## 🤝 Contributing

Contributions are welcome. Report bugs, suggest features or submit pull requests.

## 📄 License

Open source under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This is a personal budget tracking tool. Back up your data regularly with **Export**.

---

Made with ❤️ for better financial management
