import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import CreatePost from "./CreatePost.jsx";
import { Routes, Route } from 'react-router-dom'

export default function App() {
    return (
        <div className="bg-background min-h-screen text-on-background font-sans">
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-post" element={<CreatePost />} />
                {/*<Route path="/profile" element={<Profile />} />*/}
            </Routes>
            <Footer />
        </div>
    )
}