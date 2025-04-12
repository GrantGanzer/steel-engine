import React from 'react';


const Nav = ({resetQuestionnaire}) => (
    <div className="nav">
        <button onClick={resetQuestionnaire}>
            <img
                src="/images/logohigh.jpg"
                alt="SteelEngine Logo"
                className="logo-img"
            />
            <p className="logo-sub">Custom steel recommendations</p>
        </button>
    </div>
);

export default Nav;
