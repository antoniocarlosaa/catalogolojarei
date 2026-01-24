import React from 'react';

interface SearchBarProps {
    search: string;
    setSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
    return (
        <div className="w-full flex justify-center mt-4 relative z-30 px-4">
            <div className="w-full max-w-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold to-yellow-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center shadow-2xl">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Busque por marca, modelo..."
                        className="w-full h-14 pl-8 pr-16 rounded-full bg-white border border-gray-200 text-black placeholder:text-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-lg"
                    />
                    <button className="absolute right-2 top-2 h-10 w-10 bg-gold rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
