function checkCollision(objA, objB) {
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
    );
}

function resolveCollision(playerA, playerB) {
    const dx = playerB.x - playerA.x;
    const dy = playerB.y - playerA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = playerA.width;

    if (distance < minDistance) {
        const angle = Math.atan2(dy, dx);
        const pushX = (minDistance - distance) * Math.cos(angle) * 0.5;
        const pushY = (minDistance - distance) * Math.sin(angle) * 0.5;

        playerA.x -= pushX;
        playerA.y -= pushY;
        playerB.x += pushX;
        playerB.y += pushY;
    }
}
