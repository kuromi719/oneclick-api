export default function Footer() {
    return (
        <footer className="p-6 bg-gray-200 dark:bg-gray-800 text-center text-gray-700 dark:text-gray-300">
            © {new Date().getFullYear()} OneClick API Builder. All rights reserved.
        </footer>
    );
}
