(function () {
    class MemoryBubbleExtension extends TavernExtension {
        constructor() {
            super('memory-bubble');
        }

        onInit() {
            console.log("聊天气泡回忆扩展已加载。");
            
            // 绑定函数，确保 'this' 指向正确
            this.runBubbleInjection = this.runBubbleInjection.bind(this);

            // 监听多个可能改变聊天内容的事件
            this.eventSource.on('message-rendered', this.runBubbleInjection);
            this.eventSource.on('chat-loaded', this.runBubbleInjection);
            this.eventSource.on('message-sent', this.runBubbleInjection);
            this.eventSource.on('message-swiped', this.runBubbleInjection);
            this.eventSource.on('message-deleted', this.runBubbleInjection);
        }

        runBubbleInjection() {
            // 使用 setTimeout 延迟执行，确保DOM已经完全更新
            setTimeout(() => {
                document.querySelectorAll('.memory-bubble-container').forEach(el => el.remove());

                const messages = document.querySelectorAll('#chat .mes');
                messages.forEach((msg, index) => {
                    const isCharacterMessage = !msg.classList.contains('is_user');
                    // 同样不在最后一条消息后添加
                    if (isCharacterMessage && index < messages.length - 1) {
                        this.injectBubbleAfter(msg);
                    }
                });

                this.addBubbleEventListeners();
            }, 100); // 延迟100毫秒
        }

        injectBubbleAfter(messageElement) {
            // 检查是否已经存在气泡，避免重复添加
            if (messageElement.nextElementSibling && messageElement.nextElementSibling.classList.contains('memory-bubble-container')) {
                return;
            }

            const bubbleContainer = document.createElement('div');
            bubbleContainer.className = 'memory-bubble-container';
            bubbleContainer.innerHTML = `
                <div class="memory-bubble">
                    <span class="bubble-text"></span>
                </div>
            `;
            messageElement.parentNode.insertBefore(bubbleContainer, messageElement.nextSibling);
        }

        addBubbleEventListeners() {
            const bubbles = document.querySelectorAll('.memory-bubble');
            bubbles.forEach(bubble => {
                // 为防止重复绑定，先移除旧的监听器
                bubble.removeEventListener('mouseover', this.onBubbleHover.bind(this));
                bubble.addEventListener('mouseover', this.onBubbleHover.bind(this));
            });
        }
        
        onBubbleHover(event) {
            const bubble = event.currentTarget;
            const bubbleTextElement = bubble.querySelector('.bubble-text');

            const characterMessages = Array.from(document.querySelectorAll('#chat .mes:not(.is_user) .mes_text'))
                .map(el => el.textContent.trim())
                .filter(text => text.length > 0);

            if (characterMessages.length === 0) {
                bubbleTextElement.textContent = "（还没有足够的回忆...）";
                return;
            }

            const sentences = [];
            characterMessages.forEach(msg => {
                const msgSentences = msg.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 5);
                sentences.push(...msgSentences);
            });

            if (sentences.length === 0) {
                bubbleTextElement.textContent = "（回忆都是些片段...）";
                return;
            }

            const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
            bubbleTextElement.textContent = `“${randomSentence}”`;
        }
    }

    Tavern.registerExtension(new MemoryBubbleExtension());
})();