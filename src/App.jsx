import { useState, useEffect } from 'react';
import { BookOpen, Zap, Coins, Dna, RefreshCw, Sparkles, Gift, Info } from 'lucide-react';
import PixelArt from './components/PixelArt';
import {
  OFFICE_QUOTES, EVOLUTION_STAGES, ITEMS, RARITIES, FACTIONS,
  BABY_DEX, YOUTH_DEX, ADULT_PETS, TOTAL_DEX_COUNT,
  rollGacha, shuffleArray
} from './gameData';

export default function App() {
  const [coins, setCoins] = useState(100);
  const [hasFreePull, setHasFreePull] = useState(true);
  const [pet, setPet] = useState(null);
  const [unlockedPets, setUnlockedPets] = useState([]);
  const [showPokedex, setShowPokedex] = useState(false);
  const [isGachaRolling, setIsGachaRolling] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [passiveTexts, setPassiveTexts] = useState([]);
  const [unlockedBgs, setUnlockedBgs] = useState(['default']);
  const [currentBg, setCurrentBg] = useState('default');
  const [equippedAccessories, setEquippedAccessories] = useState([]);
  const [unlockedAccessories, setUnlockedAccessories] = useState([]);
  const [showBgShop, setShowBgShop] = useState(false);
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  const [showFactionProb, setShowFactionProb] = useState(false);
  const [selectedDexPet, setSelectedDexPet] = useState(null);

  const BG_SHOP = [
    { id: 'default', name: '預設辦公室', cost: 0, icon: '🏢' },
    { id: 'lightning', name: '閃電', cost: 80000, icon: '⚡' },
    { id: 'tree', name: '顧眼睛', cost: 55000, icon: '🌳' },
    { id: 'big_dipper', name: '北斗七星', cost: 125000, icon: '✨' }
  ];

  const ACCESSORY_SHOP = [
    { id: 'aaron_sign', name: '阿隆簽名掛飾', cost: 1688, icon: '🖊️' },
    { id: 'lazy_pendant', name: '不想上班 (掛件)', cost: 550000, icon: '🥱' },
    { id: 'love_work', name: '熱愛工作 (右看板)', cost: 66000, icon: '💼' },
    { id: 'chicken_poster', name: '吃雞排 (左海報)', cost: 66000, icon: '🍗' }
  ];

  const handleBuyBg = (bg) => {
    if (unlockedBgs.includes(bg.id)) {
      setCurrentBg(bg.id === currentBg ? 'default' : bg.id);
    } else if (coins >= bg.cost) {
      setCoins(prev => prev - bg.cost);
      setUnlockedBgs(prev => [...prev, bg.id]);
      setCurrentBg(bg.id);
    }
  };

  const handleBuyAccessory = (acc) => {
    if (unlockedAccessories.includes(acc.id)) {
      setEquippedAccessories(prev => 
        prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
      );
    } else if (coins >= acc.cost) {
      setCoins(prev => prev - acc.cost);
      setUnlockedAccessories(prev => [...prev, acc.id]);
      setEquippedAccessories(prev => [...prev, acc.id]);
    }
  };
  const [quotePlaylist, setQuotePlaylist] = useState(() => shuffleArray(OFFICE_QUOTES));
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Unlock collection entries as pet evolves
  useEffect(() => {
    if (pet && !isGachaRolling && pet.adultForm) {
      if (pet.stage.id === 'stage1' && !unlockedPets.includes(pet.rarity.id)) {
        setUnlockedPets(prev => [...prev, pet.rarity.id]);
      }
      if (pet.stage.id === 'stage2' && !unlockedPets.includes(pet.adultForm.babyId)) {
        setUnlockedPets(prev => [...prev, pet.adultForm.babyId]);
      }
      if (pet.stage.id === 'stage3' && !unlockedPets.includes(pet.adultForm.youthId)) {
        setUnlockedPets(prev => [...prev, pet.adultForm.youthId]);
      }
      if (pet.stage.id === 'stage4' && !unlockedPets.includes(pet.adultForm.id)) {
        setUnlockedPets(prev => [...prev, pet.adultForm.id]);
      }
    }
  }, [pet, unlockedPets, isGachaRolling]);

  // Rotate quotes when pet reaches adult stage
  useEffect(() => {
    if (pet && pet.stage.id === 'stage4' && !isGachaRolling) {
      setQuoteIndex(prev => (prev + 1) % quotePlaylist.length);
      const quoteInterval = setInterval(() => {
        setQuoteIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= quotePlaylist.length) {
            setQuotePlaylist(shuffleArray(OFFICE_QUOTES));
            return 0;
          }
          return nextIndex;
        });
      }, 6000);
      return () => clearInterval(quoteInterval);
    }
  }, [pet?.stage?.id, isGachaRolling, quotePlaylist.length]);

  // Main game tick
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => { setIsFocused(false); setFocusTime(0); };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const tick = setInterval(() => {
      if (isFocused) setFocusTime(prev => prev + 1);

      if (pet) {
        const isFocusedBonus = focusTime > 5 ? 50.0 : 1.0;
        const tickSpeed = 1;
        const stageMultiplier = pet.stage.id === 'stage4' && pet.adultForm
          ? (pet.adultForm.incomeMultiplier || 1.0) : 1.0;

        const coinGain = 1 * pet.rarity.multiplier * isFocusedBonus * pet.mood * stageMultiplier;
        setCoins(prev => prev + coinGain);

        if (pet.stage.id === 'stage4' && !isGachaRolling) {
          const newId = Date.now();
          if (pet.adultForm?.id === 'rainbow_dragon') {
            setPassiveTexts(prev => [...prev, { id: newId, text: '阿隆請喝飲料' }]);
          } else {
            const displayGain = coinGain % 1 === 0 ? coinGain : (Math.round(coinGain * 10) / 10);
            setPassiveTexts(prev => [...prev, { id: newId, text: `+$${displayGain}` }]);
          }
          setTimeout(() => {
            setPassiveTexts(prev => prev.filter(t => t.id !== newId));
          }, 1000);
        }

        if (!isGachaRolling) {
          setPet(prevPet => {
            if (!prevPet) return prevPet;
            let newAge = prevPet.age + tickSpeed;
            let newStage = prevPet.stage;

            if (newAge >= prevPet.stage.nextAt) {
              if (prevPet.stage.id === 'stage1') newStage = EVOLUTION_STAGES.STAGE2;
              else if (prevPet.stage.id === 'stage2') newStage = EVOLUTION_STAGES.STAGE3;
              else if (prevPet.stage.id === 'stage3') newStage = EVOLUTION_STAGES.STAGE4;
            }
            return { ...prevPet, age: newAge, stage: newStage };
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(tick);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [pet, isFocused, focusTime, isGachaRolling]);

  const handleDrawEgg = () => {
    if (!hasFreePull && coins < 100) return;
    if (!hasFreePull) setCoins(prev => prev - 100);
    setIsGachaRolling(true);

    setTimeout(() => {
      const drawnRarity = rollGacha();
      const availableAdults = ADULT_PETS.filter(a => a.rarity === drawnRarity.id);
      const chosenAdult = availableAdults.length > 0
        ? availableAdults[Math.floor(Math.random() * availableAdults.length)]
        : ADULT_PETS[0];

      setPet({ stage: EVOLUTION_STAGES.STAGE1, rarity: drawnRarity, age: 0, mood: 1.0, adultForm: chosenAdult });
      setHasFreePull(false);
      setIsGachaRolling(false);
    }, 1000);
  };

  const handleRerollEgg = () => {
    if (coins < 100) return;
    setCoins(prev => prev - 100);
    setIsGachaRolling(true);

    setTimeout(() => {
      const drawnRarity = rollGacha();
      const availableAdults = ADULT_PETS.filter(a => a.rarity === drawnRarity.id);
      const chosenAdult = availableAdults.length > 0
        ? availableAdults[Math.floor(Math.random() * availableAdults.length)]
        : ADULT_PETS[0];

      setPet(prev => ({ ...prev, rarity: drawnRarity, adultForm: chosenAdult, age: 0 }));
      setIsGachaRolling(false);
    }, 1000);
  };

  const handlePetClick = (e) => {
    if (!pet || isGachaRolling) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newText = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top, text: '+ EXP' };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => { setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)); }, 1000);
    setCoins(prev => prev + 2);
  };

  const buyAndUseItem = (item) => {
    if (coins >= item.cost && pet) {
      setCoins(prev => prev - item.cost);
      setPet(prev => ({ ...prev, age: prev.age + item.growth }));
      const newText = { id: Date.now(), x: Math.random() * 100 + 100, y: Math.random() * 100 + 100, text: `+${item.growth} 成長` };
      setFloatingTexts(prev => [...prev, newText]);
      setTimeout(() => { setFloatingTexts(prev => prev.filter(t => t.id !== newText.id)); }, 1000);
    }
  };

  const retirePet = () => {
    setPet(null);
    setCoins(prev => prev + 168);
  };

  const progressData = (() => {
    if (!pet) return { percent: 0, text: '' };
    if (pet.stage.id === 'stage4') return { percent: 100, text: '已成年' };

    let stageStart = 0;
    if (pet.stage.id === 'stage2') stageStart = EVOLUTION_STAGES.STAGE1.nextAt;
    if (pet.stage.id === 'stage3') stageStart = EVOLUTION_STAGES.STAGE2.nextAt;
    
    const currentProgress = pet.age - stageStart;
    const stageDuration = pet.stage.nextAt - stageStart;
    const percent = Math.min(100, Math.max(0, (currentProgress / stageDuration) * 100));

    const remainingSeconds = Math.max(0, EVOLUTION_STAGES.STAGE3.nextAt - pet.age);
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    
    let text = '';
    if (h > 0) text = `${h}h ${m}m`;
    else if (m > 0) text = `${m}m ${s}s`;
    else text = `${s}s`;

    return { percent, text };
  })();
  const isFocusedBonusActive = focusTime > 5;
  const currentStageItems = pet && pet.stage.id !== 'stage4'
    ? ITEMS.filter(item => item.stage === pet.stage.id)
    : [];

  const getRarityGlowClass = (rarityId) => `rarity-glow-${rarityId}`;

  const getPetTemplateName = () => {
    if (!pet) return 'egg_common';
    if (pet.stage.id === 'stage1') return pet.rarity.eggTemplate;
    if (pet.stage.id === 'stage2') return pet.adultForm?.babyId || 'baby_pet';
    if (pet.stage.id === 'stage3') return pet.adultForm?.youthId || 'youth_dog';
    return pet.adultForm?.templateName || 'chicken';
  };

  const getAnimClass = () => {
    if (!pet) return '';
    if (pet.stage.id === 'stage1') return 'anim-egg-shake';
    if (pet.stage.id === 'stage2') return 'anim-baby-jump';
    if (pet.stage.id === 'stage3') return 'anim-youth-walk';
    // stage4: rarity-specific adult animation
    return `anim-adult-${pet.rarity.id}`;
  };

  const getSpeechText = () => {
    if (!pet || isGachaRolling) return '';
    if (pet.stage.id === 'stage1') return '孵化中...';
    if (pet.stage.id === 'stage2') return '肚子餓了！';
    if (pet.stage.id === 'stage3') return '快速成長中！';
    if (pet.stage.id === 'stage4' && pet.adultForm) return quotePlaylist[quoteIndex];
    return '';
  };

  const getRarityForDexId = (id) => {
    const adult = ADULT_PETS.find(a => a.id === id);
    if (adult) return RARITIES.find(r => r.id === adult.rarity);
    return null;
  };

  return (
    <div className="game-bg min-h-[100dvh] flex items-center justify-center py-6 px-4 sm:px-8 md:p-12 lg:p-16 select-none overflow-x-hidden">

      {/* === Device Shell === */}
      <div className="device-shell w-full max-w-6xl rounded-[20px] p-6 sm:p-8 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-5 lg:gap-8 relative shadow-2xl">

        {/* === Left: LCD Screen === */}
        <div className={`lcd-screen flex-1 rounded-xl border border-white/5 flex flex-col relative min-h-[520px] lg:min-h-[560px] p-2 overflow-hidden ${currentBg === 'lightning' ? 'bg-lightning' : currentBg === 'tree' ? 'bg-tree' : currentBg === 'big_dipper' ? 'bg-dipper' : ''}`}>

          {currentBg === 'big_dipper' && (
            <div className="absolute inset-0 z-0 pointer-events-none rounded-2xl">
              <svg className="absolute inset-0 w-full h-full stroke-white/20 fill-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="20" y1="60" x2="30" y2="50" strokeWidth="0.8" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '0.1s' }} />
                <line x1="30" y1="50" x2="42" y2="45" strokeWidth="1.5" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '0.3s' }} />
                <line x1="42" y1="45" x2="55" y2="48" strokeWidth="0.5" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '0.5s' }} />
                <line x1="55" y1="48" x2="50" y2="65" strokeWidth="2.0" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '0.7s' }} />
                <line x1="50" y1="65" x2="65" y2="70" strokeWidth="1.0" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '0.9s' }} />
                <line x1="65" y1="70" x2="70" y2="45" strokeWidth="1.5" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '1.1s' }} />
                <line x1="70" y1="45" x2="55" y2="48" strokeWidth="0.8" style={{ animation: 'dipper-line-appear 4s infinite alternate', animationDelay: '1.3s' }} />
              </svg>
              <div className="absolute top-[60%] left-[20%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '0s' }} />
              <div className="absolute top-[50%] left-[30%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '0.2s' }} />
              <div className="absolute top-[45%] left-[42%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '0.4s' }} />
              <div className="absolute top-[48%] left-[55%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '0.6s' }} />
              <div className="absolute top-[65%] left-[50%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '0.8s' }} />
              <div className="absolute top-[70%] left-[65%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '1.0s' }} />
              <div className="absolute top-[45%] left-[70%] w-3 h-3 bg-white rounded-full shadow-[0_0_12px_fff] transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ animation: 'dipper-star-appear 4s infinite alternate', animationDelay: '1.2s' }} />
            </div>
          )}

          {equippedAccessories.includes('aaron_sign') && (
            <div className="absolute top-0 left-[15%] z-20 origin-top pointer-events-none flex flex-col items-center" style={{ animation: 'swing-accessory 3s ease-in-out infinite' }}>
              <div className="w-[3px] h-32 bg-amber-700/60 rounded-full"></div>
              <div className="bg-[#f4e4bc] text-amber-900 border border-amber-800/40 px-3 py-1.5 font-bold shadow-lg shadow-black/30"
                style={{ fontFamily: 'var(--font-pixel)', borderRadius: '6px', fontSize: '18px' }}>
                ~阿隆~
              </div>
            </div>
          )}

          {equippedAccessories.includes('lazy_pendant') && (
            <div className="absolute top-0 left-[35%] z-20 origin-top pointer-events-none flex flex-col items-center" style={{ animation: 'swing-accessory 4s ease-in-out infinite' }}>
              <div className="w-[2px] h-20 bg-gray-400/60 rounded-full"></div>
              <div className="bg-slate-800 text-red-500 border border-red-500/50 px-3 py-2 font-black shadow-lg shadow-black/50"
                style={{ fontFamily: 'var(--font-pixel)', borderRadius: '8px', fontSize: '16px', letterSpacing: '2px' }}>
                不想上班
              </div>
            </div>
          )}

          {equippedAccessories.includes('love_work') && (
            <div className="absolute bottom-16 right-6 z-20 pointer-events-none flex flex-col items-center transform rotate-6 hover:rotate-0 transition-transform origin-bottom">
              <div className="bg-amber-100 text-red-600 border-[6px] border-amber-800/90 px-3 py-6 font-black shadow-2xl shadow-black/50"
                 style={{ fontFamily: 'var(--font-pixel)', fontSize: '24px', writingMode: 'vertical-rl', letterSpacing: '12px', borderRadius: '4px' }}>
                熱愛工作
              </div>
              <div className="w-6 h-12 bg-amber-900/90 -mt-2 rounded-b-sm shadow-md"></div>
              <div className="w-16 h-4 bg-amber-950/90 -mt-1 rounded border-b-[3px] border-black/30 shadow-lg"></div>
            </div>
          )}

          {equippedAccessories.includes('chicken_poster') && (
            <div className="absolute top-24 left-6 z-10 pointer-events-none transform -rotate-3 opacity-95 shadow-lg shadow-black/20"
                 style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }}>
              <div className="bg-[#fff9e6] text-[#b45309] border flex flex-col items-center justify-center p-3 relative"
                   style={{ width: '100px', height: '140px' }}>
                 <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/40 rotate-2 backdrop-blur-sm shadow-sm"></div>
                 <span className="text-4xl mb-2 drop-shadow-md">🍗</span>
                 <span className="font-bold text-center leading-relaxed tracking-widest text-[#92400e]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px' }}>
                    下午茶<br/>吃雞排
                 </span>
              </div>
            </div>
          )}

          {/* Status Badges */}
          {pet && (
            <div className="absolute top-4 left-4 z-30 flex flex-col items-start gap-2.5">
              <div className="status-badge rounded-xl overflow-hidden font-bold flex flex-col gap-1.5 anim-rarity-reveal">
                <div className="h-[3px] w-full" style={{ background: pet.rarity.cssColor }}></div>
                <div className="flex items-center gap-2.5 text-base px-5 pb-3 pt-2">
                  <Sparkles className="w-4 h-4" style={{ color: pet.rarity.cssColor }} />
                  <span className="text-white/80 font-black">{pet.stage.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${pet.rarity.cssColor}18`, color: pet.rarity.cssColor, border: `1px solid ${pet.rarity.cssColor}30` }}>
                    {pet.rarity.name}
                  </span>
                </div>
                {pet.adultForm && (pet.stage.id === 'stage2' || pet.stage.id === 'stage3') && (
                  <div className="flex items-center gap-2 px-5 pb-3 -mt-1">
                    <span className="text-sm text-white/35">{pet.adultForm.faction}</span>
                  </div>
                )}
                {pet.stage.id === 'stage4' && pet.adultForm && (
                  <div className="flex items-center gap-2 px-5 pb-3 -mt-1">
                    <span className="text-lg font-black" style={{ color: pet.rarity.cssColor }}>{pet.adultForm.name}</span>
                    <span className="text-xs text-white/25">{pet.adultForm.faction}</span>
                  </div>
                )}
              </div>

              {pet.stage.id === 'stage1' && !isGachaRolling && (
                <button
                  onClick={handleRerollEgg}
                  disabled={coins < 100 || isGachaRolling}
                  className="btn-item rounded-xl px-4 py-2.5 font-bold flex items-center gap-2 text-base"
                >
                  <RefreshCw className={`w-5 h-5 ${isGachaRolling ? 'animate-spin' : ''}`} />
                  <span>{isGachaRolling ? '抽取中' : '重抽'}</span>
                  {!isGachaRolling && (
                    <span className="text-sm flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded">
                      100 <Coins className="w-4 h-4" />
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Speech Bubble */}
          {pet && !isGachaRolling && getSpeechText() && (
            <div className="absolute top-20 lg:top-4 right-4 max-w-[55%] lg:max-w-[300px] z-30 anim-speech"
              style={{ position: 'absolute' }}>
              <div className="speech-bubble rounded-xl px-4 py-3 text-sm lg:text-base font-bold break-words"
                style={{ color: pet.rarity.cssColor }}>
                {getSpeechText()}
              </div>
            </div>
          )}

          {/* Central Pet Display */}
          <div className="flex-1 flex flex-col justify-center items-center relative z-10 mt-16 mb-28 px-4">
            {isGachaRolling ? (
              <div className="anim-gacha-spin">
                <PixelArt templateName="egg_common" size={140} color="rgba(255,255,255,0.5)" />
              </div>
            ) : !pet ? (
              <div className="flex flex-col items-center opacity-30">
                <PixelArt templateName="egg_common" size={160} color="rgba(255,255,255,0.4)" />
                <p className="mt-6 font-bold tracking-widest text-sm text-white/50" style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>
                  等待抽取新蛋...
                </p>
              </div>
            ) : (
              <div
                className="relative cursor-pointer hover:scale-105 transition-transform active:scale-95 z-10"
                onClick={handlePetClick}
              >
                <div className={`relative flex justify-center items-center ${getAnimClass()} ${getRarityGlowClass(pet.rarity.id)}`}>
                  <PixelArt
                    templateName={getPetTemplateName()}
                    size={180}
                    color={pet.adultForm?.id === 'rainbow_dragon' && pet.stage.id === 'stage4' ? undefined : pet.rarity.cssColor}
                    className={pet.adultForm?.id === 'rainbow_dragon' && pet.stage.id === 'stage4' ? 'text-rainbow' : ''}
                  />

                  {passiveTexts.map(pt => (
                    <div key={pt.id}
                      className="absolute font-black text-lg pointer-events-none anim-float-up z-20"
                      style={{ right: '-30px', top: '10px', color: '#ffd700' }}>
                      {pt.text}
                    </div>
                  ))}
                </div>

                {floatingTexts.map(ft => (
                  <div key={ft.id}
                    className="absolute font-bold text-2xl pointer-events-none anim-float-up"
                    style={{ left: ft.x, top: ft.y, color: pet.rarity.cssColor }}>
                    {ft.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Area */}
          <div className="absolute bottom-16 left-0 w-full flex flex-row justify-center items-center gap-3 md:gap-4 px-5 md:px-10 z-20">
            {!pet ? (
              <button
                onClick={handleDrawEgg}
                disabled={(!hasFreePull && coins < 100) || isGachaRolling}
                className="btn-primary rounded-xl px-10 py-4 font-bold text-xl flex items-center gap-2"
              >
                {isGachaRolling ? '抽取中...' : hasFreePull
                  ? '✨ 免費首抽 !'
                  : <><Coins className="w-5 h-5" /> 100 抽蛋</>}
              </button>
            ) : (
              <>
                {currentStageItems.map(item => {
                  const canAfford = coins >= item.cost;
                  return (
                    <button
                      key={item.id}
                      onClick={() => buyAndUseItem(item)}
                      disabled={!canAfford || isGachaRolling}
                      className="btn-item flex-1 flex flex-col xl:flex-row items-center justify-center rounded-xl p-3 md:p-4 font-bold"
                    >
                      <PixelArt templateName={item.templateName} size={30} className="mb-1 xl:mb-0 xl:mr-2" color="rgba(255,255,255,0.6)" />
                      <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
                        <span className="text-sm lg:text-base whitespace-nowrap">
                          {item.name}
                          <span className="hidden sm:inline text-xs text-white/30 ml-1">(+{item.growth})</span>
                        </span>
                        <span className="text-xs flex items-center gap-0.5 text-amber-300/70 mt-0.5">
                          {item.cost} <Coins className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}

                {pet.stage.id === 'stage4' && (
                  <button
                    onClick={retirePet}
                    className="btn-primary w-full max-w-sm flex items-center justify-center rounded-xl px-10 py-5 font-bold text-xl"
                  >
                    辦理退休 (+168 <Coins className="w-5 h-5 mx-1 text-amber-300" />)
                  </button>
                )}
              </>
            )}
          </div>

          {/* Ground Decoration */}
          <div className="absolute bottom-0 h-14 w-full lcd-ground flex items-end justify-around px-10 z-0 opacity-30 pointer-events-none">
            <PixelArt templateName="grass" size={52} color="rgba(100,180,100,0.5)" />
            <PixelArt templateName="grass" size={60} color="rgba(100,180,100,0.4)" className="mb-2" />
            <PixelArt templateName="grass" size={44} color="rgba(100,180,100,0.5)" />
            <PixelArt templateName="grass" size={52} color="rgba(100,180,100,0.4)" className="mb-1" />
          </div>
        </div>

        {/* === Right: Control Panel === */}
        <div className="w-full lg:w-[350px] flex flex-col gap-5 lg:gap-6 min-h-0 pl-1 lg:pl-2">

          {/* Stats Card */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 lg:px-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <span className="text-white/40 font-bold text-base">持有金幣</span>
              <div className="coin-badge flex items-center gap-2 px-5 py-2.5 rounded-lg">
                <Coins className="w-6 h-6 text-amber-300" />
                <span className="font-bold text-2xl text-amber-200">{Math.floor(coins)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span 
                className="text-white/40 font-bold text-base flex items-center gap-1.5 cursor-pointer hover:text-white/70 transition-colors"
                onClick={() => setShowCoinInfo(true)}
              >
                <span>金幣加成</span>
                <Info className="w-4 h-4 text-emerald-400" />
              </span>
              <div className={`flex items-center gap-2 text-base font-bold px-4 py-2.5 rounded-lg transition-colors ${
                isFocusedBonusActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 text-white/30 border border-white/10'
              }`}>
                <Zap className={`w-5 h-5 ${isFocusedBonusActive ? 'animate-pulse' : ''}`} />
                <span>{isFocusedBonusActive ? '50x 試玩版' : '未加成'}</span>
              </div>
            </div>

            {pet && (
              <div className="mt-1">
                <div className="flex justify-between items-end text-sm font-bold mb-1.5">
                  <span className="text-white/40 mb-0.5">成長進度</span>
                  <div className="flex flex-col items-end">
                    <span style={{ color: pet.rarity.cssColor }}>{Math.floor(progressData.percent)}%</span>
                    {pet.stage.id !== 'stage4' && (
                      <span className="text-white/30 text-[10px] tracking-widest font-normal -mt-0.5">
                        預計還要: <span className="text-white/50">{progressData.text}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="progress-track w-full h-4 rounded-full overflow-hidden">
                  <div
                    className="progress-fill h-full rounded-full"
                    style={{
                      width: `${progressData.percent}%`,
                      background: `linear-gradient(90deg, ${pet.rarity.cssColor}88, ${pet.rarity.cssColor})`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gacha Rates */}
          <div className="glass-panel flex-1 rounded-2xl p-5 sm:p-6 lg:px-8 flex flex-col min-h-0 overflow-hidden">
            <div className="text-center font-bold text-base text-white/50 mb-4 shrink-0 border-b border-white/5 pb-3 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
              抽蛋機率表
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
              {RARITIES.map(r => (
                <div key={r.id} className="prob-row flex justify-between items-center px-4 py-2.5 rounded-lg text-base font-bold">
                  <span style={{ color: r.cssColor }}>{r.name}</span>
                  <span className="text-white/40">{(r.chance * 100)}%</span>
                </div>
              ))}
              <div className="mt-2 pt-3 border-t border-white/10">
                <button 
                  onClick={() => setShowFactionProb(true)}
                  className="w-full text-center font-bold text-xs text-white/50 py-2 hover:bg-white/5 rounded-lg tracking-widest uppercase transition-colors flex justify-center items-center gap-2" 
                  style={{ fontFamily: 'var(--font-pixel)' }}
                >
                  <Info className="w-3 h-3 text-white/50" />
                  派系機率 !
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <div className="flex gap-3">
              <button
                onClick={() => setShowBgShop(true)}
                className="btn-primary rounded-xl p-5 font-bold text-lg flex justify-center items-center gap-2"
                title="佈景商店"
              >
                <Gift className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowPokedex(true)}
                className="btn-primary flex-1 rounded-xl p-5 font-bold text-lg flex justify-center items-center gap-2"
              >
                <BookOpen className="w-6 h-6" />
                <span>圖鑑</span>
                <span className="text-sm text-white/40 ml-1">({unlockedPets.length}/{TOTAL_DEX_COUNT})</span>
              </button>
            </div>
            <div className="text-right text-[10px] text-white/20 font-mono pr-2 tracking-widest select-text">
              v0331-2
            </div>
          </div>
        </div>

        {/* === Pokedex Modal === */}
        {showPokedex && (
          <div className="fixed inset-0 pokedex-overlay z-40 flex justify-center items-center p-4 md:p-8"
               onClick={() => setShowPokedex(false)}>
            <div className="w-full max-w-5xl h-[95%] glass-panel rounded-2xl p-5 lg:p-8 flex flex-col border border-white/8"
                 onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5 border-b border-white/8 pb-4 shrink-0">
                <h3 className="font-bold text-xl lg:text-2xl flex items-center gap-3 text-white/90">
                  <BookOpen className="w-7 h-7 lg:w-8 lg:h-8" />
                  <span>收藏圖鑑系統</span>
                  <span className="text-sm text-white/30 font-normal">({unlockedPets.length}/{TOTAL_DEX_COUNT})</span>
                </h3>
                <button onClick={() => setShowPokedex(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white/80 text-xl w-10 h-10 flex items-center justify-center transition-colors">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-3">

                {/* Section 1: Eggs */}
                <DexSection title="蛋的種類" count={RARITIES.length} index="1">
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {RARITIES.map(egg => {
                      const isUnlocked = unlockedPets.includes(egg.id);
                      return (
                        <div key={egg.id} className={`pokedex-card ${!isUnlocked ? 'locked' : 'cursor-pointer hover:bg-white/10 transition-colors'} rounded-xl p-3 flex flex-col items-center justify-center h-36 lg:h-44`}
                          style={isUnlocked ? { borderColor: `${egg.cssColor}33` } : {}}
                          onClick={() => { if(isUnlocked) setSelectedDexPet({ type: 'egg', data: egg, color: egg.cssColor, template: egg.eggTemplate, desc: '初始蛋' }); }}>
                          <div className="mb-2">
                            <PixelArt templateName={isUnlocked ? egg.eggTemplate : 'egg_common'} size={48}
                              color={isUnlocked ? egg.cssColor : 'rgba(255,255,255,0.1)'} />
                          </div>
                          <div className="font-bold text-xs text-center" style={{ color: isUnlocked ? egg.cssColor : 'rgba(255,255,255,0.2)' }}>
                            {isUnlocked ? egg.name.split(' ')[0] : '???'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DexSection>

                {/* Section 2: Babies */}
                <DexSection title="幼年雛形" count={BABY_DEX.length} index="2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {BABY_DEX.map(baby => {
                      const isUnlocked = unlockedPets.includes(baby.id);
                      return (
                        <div key={baby.id} className={`pokedex-card ${!isUnlocked ? 'locked' : 'cursor-pointer hover:bg-white/10 transition-colors'} rounded-xl p-3 flex flex-col items-center justify-center h-36 lg:h-44`}
                          onClick={() => { if(isUnlocked) setSelectedDexPet({ type: 'baby', data: baby, color: '#fff', template: baby.templateName, desc: baby.desc }); }}>
                          <div className="mb-2">
                            <PixelArt templateName={isUnlocked ? baby.templateName : 'egg_common'} size={52}
                              color={isUnlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.08)'} />
                          </div>
                          <div className="font-bold text-xs text-center text-white/70">{isUnlocked ? baby.name : '???'}</div>
                          <div className="text-[10px] text-center text-white/30 mt-0.5">{isUnlocked ? baby.desc : '---'}</div>
                        </div>
                      );
                    })}
                  </div>
                </DexSection>

                {/* Section 3: Youth */}
                <DexSection title="成長少年" count={YOUTH_DEX.length} index="3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {YOUTH_DEX.map(youth => {
                      const isUnlocked = unlockedPets.includes(youth.id);
                      return (
                        <div key={youth.id} className={`pokedex-card ${!isUnlocked ? 'locked' : 'cursor-pointer hover:bg-white/10 transition-colors'} rounded-xl p-3 flex flex-col items-center justify-center h-36 lg:h-44`}
                          onClick={() => { if(isUnlocked) setSelectedDexPet({ type: 'youth', data: youth, color: '#fff', template: youth.templateName, desc: youth.desc }); }}>
                          <div className="mb-2">
                            <PixelArt templateName={isUnlocked ? youth.templateName : 'egg_common'} size={52}
                              color={isUnlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.08)'} />
                          </div>
                          <div className="font-bold text-xs text-center text-white/70">{isUnlocked ? youth.name : '???'}</div>
                          <div className="text-[10px] text-center text-white/30 mt-0.5">{isUnlocked ? youth.desc : '---'}</div>
                        </div>
                      );
                    })}
                  </div>
                </DexSection>

                {/* Section 4: Adults */}
                <DexSection title="最終成年" count={ADULT_PETS.length} index="4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
                    {ADULT_PETS.map(adult => {
                      const isUnlocked = unlockedPets.includes(adult.id);
                      const rarity = getRarityForDexId(adult.id);
                      return (
                        <div key={adult.id}
                          className={`pokedex-card ${!isUnlocked ? 'locked' : 'cursor-pointer hover:bg-white/10 transition-colors'} rounded-xl p-3 flex flex-col items-center justify-center h-36 lg:h-44`}
                          style={isUnlocked && rarity ? { borderColor: `${rarity.cssColor}33` } : {}}
                          onClick={() => { if(isUnlocked && rarity) setSelectedDexPet({ type: 'adult', data: adult, color: rarity.cssColor, template: adult.templateName, desc: `${rarity.name.split(' ')[0]} ${adult.faction}` }); }}>
                          <div className="mb-2">
                            <PixelArt templateName={isUnlocked ? adult.templateName : 'egg_common'} size={52}
                              color={isUnlocked && rarity ? rarity.cssColor : 'rgba(255,255,255,0.08)'} />
                          </div>
                          <div className="font-bold text-xs text-center leading-tight"
                            style={{ color: isUnlocked && rarity ? rarity.cssColor : 'rgba(255,255,255,0.2)' }}>
                            {isUnlocked ? adult.name : '???'}
                          </div>
                          <div className="text-[10px] text-center text-white/30 mt-0.5">
                            {isUnlocked ? adult.faction : '---'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DexSection>

              </div>
            </div>
          </div>
        )}

        {/* === Pokedex Details Modal === */}
        {selectedDexPet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pokedex-overlay"
               onClick={() => setSelectedDexPet(null)}>
            <div className="glass-panel rounded-2xl p-8 flex flex-col items-center border border-white/10 shadow-2xl relative min-w-[300px]"
                 onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedDexPet(null)}
                 className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white/80 text-xl w-10 h-10 flex items-center justify-center transition-colors z-10">
                 ✕
               </button>
               <div className="mb-6 relative mt-4">
                 <div className="absolute inset-0 blur-2xl opacity-30 rounded-full" style={{ background: selectedDexPet.color }} />
                 <PixelArt templateName={selectedDexPet.template} size={120} color={selectedDexPet.color} />
               </div>
               <h3 className="text-2xl font-black mb-2 tracking-wide" style={{ color: selectedDexPet.color }}>
                 {selectedDexPet.data.name.split(' ')[0]}
               </h3>
               {selectedDexPet.data.name.includes(' ') && (
                 <p className="text-white/50 text-xs mb-3 font-bold">{selectedDexPet.data.name.split(' ')[1]}</p>
               )}
               <p className="text-white/70 text-sm font-bold tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{selectedDexPet.desc}</p>
            </div>
          </div>
        )}

        {/* === Background Shop Modal === */}
        {showBgShop && (
          <div className="fixed inset-0 pokedex-overlay z-40 flex justify-center items-center p-4 md:p-8"
               onClick={() => setShowBgShop(false)}>
            <div className="w-full max-w-lg glass-panel rounded-2xl p-5 md:p-8 flex flex-col border border-white/8 relative max-h-[90vh]"
                 onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5 border-b border-white/8 pb-4 shrink-0">
                <h3 className="font-bold text-xl flex items-center gap-3 text-white/90">
                  <Gift className="w-6 h-6" />
                  <span>裝飾商店</span>
                </h3>
                <button onClick={() => setShowBgShop(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white/80 text-xl w-10 h-10 flex items-center justify-center transition-colors">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2 flex flex-col gap-6">
                <div>
                  <h4 className="font-bold text-base text-white/60 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4"/> 背景佈景
                  </h4>
                  <div className="flex flex-col gap-3">
                    {BG_SHOP.map(bg => {
                      const isUnlocked = unlockedBgs.includes(bg.id);
                      const isEquipped = currentBg === bg.id;
                      const canBuy = coins >= bg.cost;

                      return (
                        <div key={bg.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{bg.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-base text-white/90">{bg.name}</span>
                              {!isUnlocked && (
                                <span className="text-sm flex items-center gap-1 text-amber-300/70 mt-0.5">
                                  {bg.cost} <Coins className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleBuyBg(bg)}
                            disabled={!isUnlocked && !canBuy}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                              isEquipped ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isUnlocked ? 'bg-white/10 text-white/90 hover:bg-white/20'
                              : canBuy ? 'btn-primary'
                              : 'bg-black/20 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            {isEquipped ? '使用中' : isUnlocked ? '更換' : '購買'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-white/60 mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4"/> 小物件掛飾
                  </h4>
                  <div className="flex flex-col gap-3">
                    {ACCESSORY_SHOP.map(acc => {
                      const isUnlocked = unlockedAccessories.includes(acc.id);
                      const isEquipped = equippedAccessories.includes(acc.id);
                      const canBuy = coins >= acc.cost;

                      return (
                        <div key={acc.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{acc.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-base text-white/90">{acc.name}</span>
                              {!isUnlocked && (
                                <span className="text-sm flex items-center gap-1 text-amber-300/70 mt-0.5">
                                  {acc.cost} <Coins className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleBuyAccessory(acc)}
                            disabled={!isUnlocked && !canBuy}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                              isEquipped ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isUnlocked ? 'bg-white/10 text-white/90 hover:bg-white/20'
                              : canBuy ? 'btn-primary'
                              : 'bg-black/20 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            {isEquipped ? '裝備中' : isUnlocked ? '裝備' : '購買'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Coin Info Modal === */}
        {showCoinInfo && (
          <div className="fixed inset-0 pokedex-overlay z-50 flex justify-center items-center p-4 md:p-8"
               onClick={() => setShowCoinInfo(false)}>
            <div className="w-full max-w-lg glass-panel rounded-2xl p-5 md:p-8 flex flex-col border border-white/8 relative"
                 onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5 border-b border-white/8 pb-4">
                <h3 className="font-bold text-xl flex items-center gap-3 text-white/90">
                  <Info className="w-6 h-6 text-emerald-400" />
                  <span>金幣產出說明</span>
                </h3>
                <button onClick={() => setShowCoinInfo(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white/80 text-xl w-10 h-10 flex items-center justify-center transition-colors">
                  ✕
                </button>
              </div>

              <div className="text-white/80 space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="font-bold text-amber-300 mb-2">基礎產出</p>
                  <p className="flex items-center gap-2">每秒產生 <span className="font-bold text-white">1</span> 枚金幣 <Coins className="w-4 h-4 text-amber-300" /></p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="font-bold text-emerald-400 mb-2">計算公式</p>
                  <div className="font-mono text-sm break-all leading-relaxed opacity-90 p-3 bg-black/30 rounded-lg whitespace-pre-wrap">
                    基礎產量(1) × 稀有度加成 × 專注加成(50x) × 心情加成 × 成年專屬加成
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 max-h-[30vh] overflow-y-auto custom-scrollbar">
                  <p className="font-bold text-blue-300 mb-3">詳細加成參數</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-start">
                      <span className="text-white/60">專注加成</span>
                      <span className="font-bold text-emerald-400 text-right">進入畫面 5 秒後可獲得 50x</span>
                    </li>
                    <li className="flex justify-between items-start border-t border-white/5 pt-3">
                      <span className="text-white/60">心情加成</span>
                      <span className="font-bold text-right">目前最高 1.0x</span>
                    </li>
                    <li className="flex justify-between items-start border-t border-white/5 pt-3">
                      <span className="text-white/60">稀有度加成</span>
                      <span className="text-right font-bold text-white/90 leading-relaxed">
                        普通 (1.0x)<br/>
                        進階 (1.2x)<br/>
                        稀有 (1.5x)<br/>
                        史詩 (2.0x)<br/>
                        傳說 (3.0x)<br/>
                        神話 (5.0x)<br/>
                        究極 (10.0x)
                      </span>
                    </li>
                    <li className="flex justify-between items-start border-t border-white/5 pt-3">
                      <span className="text-white/60">成年專屬加成</span>
                      <span className="text-right font-bold">依照寵物特性決定<br/>最高可達 15.0x</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* === Faction Probabilities Modal === */}
        {showFactionProb && (
          <div className="fixed inset-0 pokedex-overlay z-50 flex justify-center items-center p-4 md:p-8"
               onClick={() => setShowFactionProb(false)}>
            <div className="w-full max-w-sm glass-panel rounded-2xl p-5 md:p-8 flex flex-col border border-white/8 relative"
                 onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5 border-b border-white/8 pb-4">
                <h3 className="font-bold text-xl flex items-center gap-3 text-white/90">
                  <Info className="w-6 h-6 text-blue-400" />
                  <span>各派系詳細機率</span>
                </h3>
                <button onClick={() => setShowFactionProb(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white/80 text-xl w-10 h-10 flex items-center justify-center transition-colors">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 px-2">
                {FACTIONS.map(f => {
                  let chance = 0;
                  RARITIES.forEach(r => {
                    const adultsInRarity = ADULT_PETS.filter(a => a.rarity === r.id);
                    const factionAdultsInRarity = adultsInRarity.filter(a => a.faction === f.name);
                    if (adultsInRarity.length > 0) {
                      chance += r.chance * (factionAdultsInRarity.length / adultsInRarity.length);
                    }
                  });
                  return (
                    <div key={f.id} className="flex justify-between items-center text-sm font-bold opacity-90 whitespace-nowrap bg-white/5 p-3 rounded-xl border border-white/5">
                      <span style={{ color: f.cssColor }}>{f.name}</span>
                      <span className="text-white/60">{(chance * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pokedex Section Component
function DexSection({ title, count, index, children }) {
  return (
    <div className="mb-8">
      <h4 className="font-bold text-base lg:text-lg text-white/80 mb-3 flex items-center gap-3">
        <span className="section-badge px-2.5 py-1 rounded-lg text-sm font-bold"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>
          {index}
        </span>
        <span>{title}</span>
        <span className="text-white/20 text-sm font-normal">({count})</span>
      </h4>
      {children}
    </div>
  );
}
