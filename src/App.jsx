import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import CreatePost from "./CreatePost.jsx";
import { Routes, Route } from 'react-router-dom'
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";

export default function App() {
    return (
        <div className="bg-background min-h-screen text-on-background font-sans">
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/create-post" element={<CreatePost />} />
                {/*<Route path="/profile" element={<Profile />} />*/}
            </Routes>
            <Footer />
        </div>
    )
}