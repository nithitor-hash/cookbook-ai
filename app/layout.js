export const metadata = {
  title: 'Cookbook AI — Find recipes from your ingredients',
  description: 'Tell us your cuisine and ingredients, get your top 5 personalized recipes powered by AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
