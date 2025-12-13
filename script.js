// TODOアプリのメインクラス
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;

        this.initElements();
        this.attachEventListeners();
        this.render();
    }

    // DOM要素の初期化
    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
    }

    // イベントリスナーの設定
    attachEventListeners() {
        // タスク追加
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // フィルター
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });

        // 完了済みタスクの削除
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    // ローカルストレージからTODOを読み込む
    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    // ローカルストレージにTODOを保存
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // 新しいTODOを追加
    addTodo() {
        const text = this.todoInput.value.trim();

        if (!text) {
            this.showError('タスクを入力してください');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
    }

    // TODOを削除
    deleteTodo(id) {
        if (confirm('このタスクを削除してもよろしいですか?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    // TODOの完了状態を切り替え
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // TODOを編集
    editTodo(id) {
        this.editingId = id;
        this.render();
    }

    // TODOの編集を保存
    saveTodoEdit(id, newText) {
        const text = newText.trim();

        if (!text) {
            this.showError('タスクは空にできません');
            return;
        }

        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.text = text;
            this.editingId = null;
            this.saveTodos();
            this.render();
        }
    }

    // 編集をキャンセル
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // 完了済みTODOを削除
    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;

        if (completedCount === 0) {
            this.showError('完了済みのタスクがありません');
            return;
        }

        if (confirm(`${completedCount}個の完了済みタスクを削除してもよろしいですか?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }
    }

    // フィルターされたTODOを取得
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // フィルターボタンの表示を更新
    updateFilterButtons() {
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 統計情報を更新
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;

        this.totalCount.textContent = `総タスク: ${total}`;
        this.activeCount.textContent = `未完了: ${active}`;
        this.completedCount.textContent = `完了: ${completed}`;
    }

    // TODOアイテムのHTMLを生成
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

        const textElement = document.createElement('span');
        textElement.className = 'todo-text';

        if (this.editingId === todo.id) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'todo-text editing';
            input.value = todo.text;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveTodoEdit(todo.id, e.target.value);
                } else if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
            input.addEventListener('blur', (e) => {
                this.saveTodoEdit(todo.id, e.target.value);
            });
            textElement.appendChild(input);
            setTimeout(() => input.focus(), 0);
        } else {
            textElement.textContent = todo.text;
        }

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn edit-btn';
        editBtn.textContent = '✏️';
        editBtn.title = '編集';
        editBtn.addEventListener('click', () => this.editTodo(todo.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = '削除';
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(textElement);
        li.appendChild(actions);

        return li;
    }

    // 画面を再描画
    render() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';

            let message = '';
            switch (this.currentFilter) {
                case 'active':
                    message = '未完了のタスクはありません';
                    break;
                case 'completed':
                    message = '完了済みのタスクはありません';
                    break;
                default:
                    message = 'タスクを追加してください';
            }

            emptyState.textContent = message;
            this.todoList.appendChild(emptyState);
        } else {
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        }

        this.updateStats();
    }

    // エラーメッセージを表示
    showError(message) {
        // 簡易的なアラート表示
        alert(message);
    }
}

// アプリの初期化
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
