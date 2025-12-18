import { useEffect, useState, useRef } from 'react';
import santaSleighGif from '../assets/santa-sleigh.gif';
import './ChristmasEffects.css';

const ChristmasEffects = () => {
    const [snowflakes, setSnowflakes] = useState([]);
    const [gifts, setGifts] = useState([]);
    const audioRef = useRef(null);
    const bgMusicRef = useRef(null);

    useEffect(() => {
        // Tạo 50 bông tuyết với vị trí và tốc độ ngẫu nhiên
        const flakes = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDuration: 5 + Math.random() * 10,
            animationDelay: Math.random() * 5,
            fontSize: 10 + Math.random() * 20,
            opacity: 0.3 + Math.random() * 0.7
        }));
        setSnowflakes(flakes);

        // Tạo audio element cho hiệu ứng hover
        audioRef.current = new Audio('/hoho.mp3');
        audioRef.current.volume = 0.7; // Tăng âm lượng lên
        audioRef.current.load(); // Preload audio
        
        // Tạo nhạc nền
        bgMusicRef.current = new Audio('/jingle.mp3');
        bgMusicRef.current.volume = 0.15; // Âm lượng nhỏ, không át hoho
        bgMusicRef.current.loop = true; // Lặp lại liên tục
        bgMusicRef.current.load();
        
        // Thử phát nhạc nền (có thể bị block bởi trình duyệt)
        const playBgMusic = () => {
            bgMusicRef.current.play()
                .then(() => {
                    console.log('Background music playing');
                })
                .catch(error => {
                    console.log('Background music blocked, need user interaction:', error);
                });
        };

        // Đợi user tương tác với trang
        const handleFirstClick = () => {
            playBgMusic();
            document.removeEventListener('click', handleFirstClick);
        };
        
        document.addEventListener('click', handleFirstClick);
        
        console.log('Audio initialized:', audioRef.current);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleFirstClick);
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
            }
        };
    }, []);

    const handleReindeerHover = () => {
        console.log('Hover detected!');
        if (audioRef.current) {
            // Giảm nhạc nền tạm thời khi phát hoho
            if (bgMusicRef.current && !bgMusicRef.current.paused) {
                bgMusicRef.current.volume = 0.05; // Giảm xuống rất nhỏ
            }
            
            audioRef.current.currentTime = 0;
            audioRef.current.play()
                .then(() => {
                    console.log('Audio playing successfully!');
                })
                .catch(error => {
                    console.error('Audio play failed:', error);
                    alert('Không thể phát âm thanh. Vui lòng click vào trang trước!');
                });
        }
        
        // Tạo quà rơi với vị trí ngẫu nhiên trên màn hình (3-4 món quà)
        const giftCount = 3 + Math.floor(Math.random() * 2);
        const newGifts = Array.from({ length: giftCount }, (_, i) => ({
            id: Date.now() + i,
            left: 5 + Math.random() * 90, // Ngẫu nhiên từ 5% đến 95%
            emoji: ['🎁', '🎀', '🎄', '⭐'][Math.floor(Math.random() * 4)],
            animationDuration: 2 + Math.random() * 1.5, // Tốc độ rơi cũng ngẫu nhiên hơn
            delay: Math.random() * 0.3 // Thêm delay ngẫu nhiên để rơi không cùng lúc
        }));
        setGifts(prev => [...prev, ...newGifts]);
        
        // Xóa quà sau khi rơi xong
        setTimeout(() => {
            setGifts(prev => prev.filter(g => !newGifts.find(ng => ng.id === g.id)));
        }, 4000);
    };

    const handleReindeerLeave = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            
            // Tăng lại nhạc nền sau khi hoho kết thúc
            if (bgMusicRef.current && !bgMusicRef.current.paused) {
                setTimeout(() => {
                    bgMusicRef.current.volume = 0.15; // Trở lại âm lượng ban đầu
                }, 300);
            }
        }
    };

    return (
        <div className="christmas-effects">
            {/* Tuyết rơi */}
            <div className="snow-container">
                {snowflakes.map((flake) => (
                    <div
                        key={flake.id}
                        className="snowflake"
                        style={{
                            left: `${flake.left}%`,
                            animationDuration: `${flake.animationDuration}s`,
                            animationDelay: `${flake.animationDelay}s`,
                            fontSize: `${flake.fontSize}px`,
                            opacity: flake.opacity
                        }}
                    >
                        ❄
                    </div>
                ))}
            </div>

            {/* Tuần lộc chạy - GIF Animation */}
            <div className="reindeer-container">
                <div 
                    className="santa-sleigh-gif"
                    onMouseEnter={handleReindeerHover}
                    onMouseLeave={handleReindeerLeave}
                    style={{ cursor: 'pointer' }}
                    title="Ho Ho Ho! 🎅"
                >
                    <img src={santaSleighGif} alt="Santa Sleigh with Reindeer" />
                </div>
            </div>

            {/* Quà rơi khi hover */}
            <div className="gifts-container">
                {gifts.map((gift) => (
                    <div
                        key={gift.id}
                        className="falling-gift"
                        style={{
                            left: `${gift.left}%`,
                            animationDuration: `${gift.animationDuration}s`,
                            animationDelay: `${gift.delay}s`
                        }}
                    >
                        {gift.emoji}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChristmasEffects;
