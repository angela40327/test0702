import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import Wheel, { WheelHandle } from './components/Wheel';
import { db } from './lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [items, setItems] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [inputText, setInputText] = useState('1,2,3,4,5,6,7,8,9,10');
  const [history, setHistory] = useState<{winner: string, timestamp: any}[]>([]);
  const wheelRef = useRef<WheelHandle>(null);

  useEffect(() => {
    const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        winner: doc.data().winner,
        timestamp: doc.data().timestamp.toDate()
      }));
      setHistory(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSpin = () => {
    setIsSpinning(true);
    setWinner(null);
    wheelRef.current?.spin();
  };

  const handleSpinEnd = async (result: string) => {
    setIsSpinning(false);
    setWinner(result);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    await addDoc(collection(db, 'history'), {
      winner: result,
      timestamp: new Date()
    });
  };

  const handleUpdate = () => {
    setItems(inputText.split(',').map(s => s.trim()).filter(s => s !== ''));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-sm text-center">
        <h1 className="text-4xl font-sans font-bold text-gray-900 mb-8">Lucky Wheel</h1>
        
        <div className="mb-6 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <button onClick={handleUpdate} className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Update</button>
        </div>

        <button 
          onClick={handleSpin} 
          disabled={isSpinning}
          className="bg-red-600 text-white text-xl font-bold px-10 py-5 rounded-full mb-8 hover:bg-red-700 disabled:opacity-50 transition"
        >
          {isSpinning ? 'Spinning...' : 'Start Spinning'}
        </button>

        <div className="relative flex justify-center">
          <div className="absolute -top-4 w-6 h-8 bg-red-600 clip-path-polygon-[50%_100%,0_0,100%_0] z-10" />
          <Wheel ref={wheelRef} items={items} isSpinning={isSpinning} onSpinEnd={handleSpinEnd} />
        </div>
      </div>

      {history.length > 0 && (
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-sm mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">History</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded flex justify-between">
                <span>{h.winner}</span>
                <span className="text-gray-500">{new Date(h.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-10 rounded-3xl text-center shadow-2xl">
              <h2 className="text-2xl mb-4">Winner!</h2>
              <p className="text-6xl font-bold text-red-600">{winner}</p>
              <button onClick={() => setWinner(null)} className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-full">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
