import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { getFullAvatarUrl } from '../utils/avatar';
import PlayerIdentity from './common/PlayerIdentity';

// Helper function to extract cropped image as base64
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    return new Promise((resolve, reject) => {
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400; // Output dimension
            canvas.height = 400;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                400,
                400
            );

            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = (error) => reject(error);
    });
};

export default function PlayerManager({ gameState, updateState }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editNumber, setEditNumber] = useState('');
    const [editGroup, setEditGroup] = useState(1);
    const [editAvatar, setEditAvatar] = useState("");

    // Image Upload and Cropping State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleEdit = (p) => {
        setEditingId(p.id);
        setEditName(p.name);
        setEditNumber((p.number ?? String(p.id ?? '')).toString().replace(/\D/g, '').slice(-3).padStart(3, '0'));
        setEditGroup(p.group || 1);
        setEditAvatar(p.avatar);
        setImageSrc(null); // Reset cropper state when editing new player
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels || !editingId) return;
        setIsUploading(true);
        try {
            const base64Image = await getCroppedImg(imageSrc, croppedAreaPixels);

            // Send base64 to server
            const response = await fetch(`http://${window.location.hostname}:3001/api/uploadAvatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingId,
                    base64: base64Image
                })
            });

            const data = await response.json();
            if (data.url) {
                setEditAvatar(data.url); // Update local preview state
                setImageSrc(null); // Close cropper
            } else {
                alert("上传头像失败");
            }
        } catch (e) {
            console.error(e);
            alert("处理图片失败");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        const numberDigits = String(editNumber || '').replace(/\D/g, '').slice(0, 3);
        if (!numberDigits) {
            alert('请输入3位选手号码');
            return;
        }
        const normalizedNumber = numberDigits.padStart(3, '0');

        const newPlayers = gameState.players.map(p => {
            if (p.id === editingId) {
                return { ...p, name: editName, number: normalizedNumber, group: parseInt(editGroup), avatar: editAvatar };
            }
            return p;
        });
        updateState({ ...gameState, players: newPlayers });
        setEditingId(null);
        setImageSrc(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setImageSrc(null);
    };

    const handleResetAll = () => {
        if (window.confirm("🔴 警告：即将清空整场比赛所有的分数、状态、对阵和对战记录，完全恢复为赛前初始模式！且该操作不可撤销！确定要继续吗？")) {
            const defaultData = {
                adminRound: 0,
                screenRound: 0,
                currentGroup: 1,
                pickingChallengerId: null,
                transitionStage: 1,
                screenTransitionStage: 1,
                players: gameState.players.map(p => ({
                    ...p,
                    score: 0,
                    status: 'default',
                    pkAgainst: null,
                    scoreDK: undefined
                })),
                pkMatches: [],
                demonKingScore: 0,
                selectedDemonKingId: null,
                activeDemonKingId: null,
                demonKingAvgScore: 0,
                dkScoreSubmitted: false,
                resurrectionCalculated: false,
                finalStageIndex: 1,
                screenFinalStageIndex: 1
            };
            updateState(defaultData);
        }
    };

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-12 relative">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-teal-400 flex items-center">
                    🕹️ 赛前设置：选手管理与重置
                </h2>
                <button
                    onClick={handleResetAll}
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
                >
                    ♻️ 一键清空所有数据并回到赛前
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 左侧角色选择区 */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 h-[450px] overflow-y-auto custom-scrollbar pr-2">
                        {gameState.players.map(p => (
                            <div key={p.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex flex-col items-center relative shadow-inner hover:bg-white/10 transition-colors">
                                <img src={getFullAvatarUrl(p.avatar)} alt="avatar" className="w-[84px] h-[84px] rounded-full mb-3 object-cover border-2 border-white/20 shadow-lg" />
                                <div className="absolute top-1 right-1 bg-slate-800 border border-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-teal-400 opacity-80 z-10">{p.group || 1}</div>
                                <PlayerIdentity
                                    player={p}
                                    className="w-full pb-2 border-b border-white/10 mb-2"
                                    compact
                                    numberClassName="text-[9px] text-slate-500"
                                    nameClassName="text-sm text-slate-300"
                                />
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="mt-1 text-sm font-bold bg-slate-700 hover:bg-teal-600 text-white px-4 py-2 rounded-lg w-full transition-colors flex justify-center items-center"
                                >
                                    📝 编辑信息
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧面板 */}
                <div className="lg:col-span-1 border-l border-slate-700 pl-6 flex flex-col h-[450px]">
                    <h3 className="text-lg text-teal-300 font-bold mb-4 bg-teal-900/30 py-2 text-center rounded">参数修改面板</h3>
                    {editingId ? (
                        <div className="flex flex-col flex-1 relative">

                            {/* 姓名修改 */}
                            <label className="text-sm text-slate-400 mb-2 font-bold flex bg-slate-800 px-3 py-1 rounded w-fit">选手姓名</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className="bg-slate-950 border-2 border-slate-600 rounded-lg p-3 text-2xl font-black text-center text-teal-300 mb-6 outline-none focus:border-teal-500 shadow-inner"
                            />

                            <label className="text-sm text-slate-400 mb-2 font-bold flex bg-slate-800 px-3 py-1 rounded w-fit">选手号码（3位）</label>
                            <input
                                type="text"
                                value={editNumber}
                                onChange={e => setEditNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                maxLength={3}
                                className="bg-slate-950 border-2 border-slate-600 rounded-lg p-3 text-2xl font-black text-center tracking-[0.35em] text-amber-300 mb-6 outline-none focus:border-amber-500 shadow-inner"
                                placeholder="001"
                            />

                            <label className="text-sm text-slate-400 mb-2 font-bold flex bg-slate-800 px-3 py-1 rounded w-fit">所属组别 (第一轮)</label>
                            <select
                                value={editGroup}
                                onChange={e => setEditGroup(e.target.value)}
                                className="bg-slate-950 border-2 border-slate-600 rounded-lg p-3 text-xl font-bold text-center text-teal-300 mb-8 outline-none focus:border-teal-500 shadow-inner cursor-pointer"
                            >
                                {[1, 2, 3, 4, 5, 6].map(g => (
                                    <option key={g} value={g}>第 {g} 组</option>
                                ))}
                            </select>

                            {/* 头像展示与上传区域 */}
                            <label className="text-sm text-slate-400 mb-2 font-bold flex bg-slate-800 px-3 py-1 rounded w-fit">专用形象设定</label>

                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 mb-4 flex-1 group">
                                <img
                                    src={getFullAvatarUrl(editAvatar)}
                                    alt="preview"
                                    className="w-32 h-32 rounded-full border-4 border-teal-500/50 object-cover shadow-[0_0_20px_rgba(20,184,166,0.2)] mb-4"
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 font-bold rounded-lg text-sm w-full transition-colors flex items-center justify-center border border-slate-500"
                                >
                                    📸 浏览本地上传新头像...
                                </button>
                            </div>

                            <div className="flex space-x-3 mt-4 pt-4 border-t border-slate-700">
                                <button onClick={handleCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-lg py-3 font-bold text-slate-300 transition-colors">取消</button>
                                <button onClick={handleSave} className="flex-[2] bg-teal-600 hover:bg-teal-500 rounded-lg py-3 font-bold text-white shadow-[0_0_15px_rgba(20,184,166,0.5)] transition-colors">✅ 保存变更</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                            <span className="text-5xl mb-6 py-4 animate-bounce">👈</span>
                            <p className="font-bold">请点击左侧列表的</p>
                            <p className="text-sm mt-1 bg-teal-900/30 px-3 py-1 rounded">"编辑按钮"</p>
                            <p className="text-sm mt-3 opacity-60">来修改号码、图片和姓名</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 沉浸式独立裁剪遮罩层 */}
            {imageSrc && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-2xl h-[500px] border-[6px] border-slate-800 bg-slate-900 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="mt-8 flex flex-col items-center space-y-8 w-full max-w-xl">
                        <div className="w-full flex items-center space-x-4">
                            <span className="text-slate-400 font-bold">小</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(e.target.value)}
                                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                            <span className="text-slate-400 font-bold text-xl">大</span>
                        </div>

                        <div className="flex space-x-6">
                            <button
                                onClick={() => setImageSrc(null)}
                                className="px-12 py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-700 hover:bg-slate-700 text-xl transition-all"
                            >
                                放弃修改
                            </button>
                            <button
                                onClick={handleSaveCroppedImage}
                                disabled={isUploading}
                                className="px-12 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black rounded-2xl border-none shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 text-xl transition-all disabled:opacity-50"
                            >
                                {isUploading ? '处理中...' : '✂️ 裁剪并确认上传'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
