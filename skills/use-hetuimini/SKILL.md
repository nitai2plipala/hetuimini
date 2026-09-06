---
name: use-hetuimini
description: 使用 hetuimini.js 轻量级 MVVM 框架开发前端应用的完整指南。当用户提到 hetuimini、hetuimini.js、或需要创建使用该框架的 HTML 页面时触发此技能。包含框架语法、最佳实践、常见错误避免等完整开发规范。
---

# Hetui Mini 框架开发指南

### 🆕 v1.2.1 修复（响应式链路完善）
修复了四个核心 Bug，响应式系统现已完整可用：
1. **嵌套对象/数组属性无 getter/setter** — `_defineObject` 内部属性统一用 `Object.defineProperty` 定义，嵌套数据变异现在能正确触发更新
2. **数组/对象整体赋值不响应** — `Observer.Define([])` 初始化空数据后，异步获取后端数据直接 `data.xxx = newArray` 即可触发视图更新
3. **foreach 子作用域污染父数据** — 循环项属性用 `Object.defineProperty` 创建为自身属性，不再沿原型链触发父数据 setter
4. **`:style` 驼峰属性名失效** — 样式名必须用 kebab-case（如 `background-color`），不能用驼峰

## 框架简介

Hetui Mini 是一个轻量级 MVVM 框架，核心设计：**数据、指令、方法三层分离**。

```
┌─────────────┬──────────────────┬─────────────────┐
│   数据 Data │   指令 Directive │   方法 Method    │
├─────────────┼──────────────────┼─────────────────┤
│ 状态管理    │ DOM 绑定声明     │ 业务逻辑        │
│ 改这→视图变 │ 改这→映射变      │ 改这→行为变     │
└─────────────┴──────────────────┴─────────────────┘
```

## 基本结构

```html
<!DOCTYPE html>
<html>
<head>
    <script src="hetuimini.js"></script>
</head>
<body>
    <div id="app">
        <span HeTui :text="count"></span>
        <button HeTui @click="increment">+1</button>
    </div>
    
    <script>
        var app = new Hetui({
            count: Observer.Define(0)
        }, document.getElementById('app'))
        .methods({
            increment(event, data) {
                data.count++;
            }
        });
    </script>
</body>
</html>
```

## 核心规则

### 1. 响应式数据必须用 Observer.Define 包装

```javascript
// ✅ 正确：Observer.Define
var app = new Hetui({
    count: Observer.Define(0),
    user: Observer.Define({ name: '张三' }),
    items: Observer.Define([])  // 空数组，异步可整体赋值
}, container);

// ❌ 错误 - 不会触发视图更新
var app = new Hetui({
    count: 0,
    user: { name: '张三' }
}, container);
```

### 1a. 异步数据赋值（v1.2.1 修复）

用 `Observer.Define([])` 初始化空数据，异步请求后端后**直接整体赋值**即可触发视图更新：

```javascript
var app = new Hetui({
    repos: Observer.Define([])  // 初始化空数组
}, container)
.methods({
    async fetchRepos(event, data) {
        var res = await fetch('/api/repos').then(r => r.json());
        data.repos = res;  // ✅ 直接整体赋值，视图自动更新
    }
});
```

> 支持的赋值方式：
> - `data.repos = newArray` — 整体替换（适用于异步请求后赋值）
> - `data.repos.push(item)` — 变异方法
> - `data.repos.splice(i, 1)` — 删除元素
> - `data.repos[i] = item` — 索引赋值
> - `data.user.profile = newObj` — 嵌套对象整体替换
```

### 2. 访问响应式数据直接使用

```javascript
console.log(data.count);  // 读取
data.count = 10;          // 写入
```

### 3. 属性路径用冒号分隔，不用点号（所有指令都支持）

**⚠️ 重要：路径分隔符必须是冒号 `:`，不是点号 `.`**

```html
<!-- ✅ 正确：冒号分隔 -->
<span :text="user:name"></span>
<input :placeholder="placeholders:email">
<span :text="errors:password"></span>

<!-- 其他指令也支持冒号分隔路径 -->
<input :value="user:email">
<div :class|active="user:isActive">
<div :style|color="user:theme:color">
<li foreach:="user:items">...</li>
<div if:="user:showModal">...</div>
<div show:="user:isVisible">...</div>

<!-- ❌ 错误：点号不支持 -->
<span :text="user.name"></span>
<span :text="errors.password"></span>
```

### 4. 元素必须有 HeTui 属性

```html
<!-- ✅ 正确 -->
<span HeTui :text="message"></span>

<!-- ❌ 错误 - 指令不生效 -->
<span :text="message"></span>
```

### 5. 事件处理使用 methods，不使用内联表达式

```html
<!-- ✅ 正确 -->
<input @input="updateUsername">

<!-- ❌ 错误 - Vue.js 语法，不支持 -->
<input @input="username = $event.target.value">
```

### 6. :style 样式名必须用 kebab-case（v1.2.1 修复）

HTML 属性会被浏览器自动转全小写，`:style` 的样式名**必须用 `-` 连接符**：

```html
<!-- ✅ 正确：kebab-case -->
<div HeTui :style|background-color="bgColor">背景</div>
<div HeTui :style|font-size="fontSize">文字</div>
<div HeTui :style|margin-top="marginTop">边距</div>

<!-- ❌ 错误：驼峰（浏览器转小写后失效） -->
<div HeTui :style|backgroundColor="bgColor">背景</div>
<div HeTui :style|fontSize="fontSize">文字</div>
```

### 7. :text 等指令不支持三元表达式

`:text` 指令的值只能是**属性路径**或**过滤器**，不支持三元表达式等复杂逻辑运算。需要条件判断时用 **computed 计算属性**：

```javascript
// ❌ 不支持
<span HeTui :text="isActive ? '是' : '否'"></span>
<span HeTui :text="count > 0 ? '有' : '无'"></span>

// ✅ 用 computed 解决
.computed({
    statusText() { return this.isActive ? '是' : '否'; },
    hasCount() { return this.count > 0 ? '有' : '无'; }
})
// HTML
<span HeTui :text="statusText"></span>
<span HeTui :text="hasCount"></span>
```

## 指令速查

### 数据绑定

| 指令 | 示例 | 说明 |
|------|------|------|
| `:text` | `:text="msg"` | 文本内容 |
| `:value` | `:value="input"` | 表单值 |
| `:attr` | `:attr|href="url"` | HTML 属性 |
| `:class` | `:class|active="flag"` 或 `:class="className"` | CSS 类（支持类名字符串绑定） |
| `:style` | `:style|color="color"` | 内联样式 |
| `:html` | `:html="content"` | HTML 内容 |
| `:data` | `:data="user:id"` | data-* 属性 |
| `:disabled` | `:disabled="flag"` | 禁用状态 |
| `:checked` | `:checked="flag"` | 选中状态 |
| `:placeholder` | `:placeholder="text"` | 占位符 |
| `:title` | `:title="tip"` | 提示文本 |

### ⚠️ 重要：指令表达式和过滤器支持说明

**不同指令对表达式和过滤器的支持情况不同**：

- **`:text` 指令**：✅ 支持表达式和过滤器
- **其他指令**：❌ 不支持表达式和过滤器，只支持简单属性路径

**不支持表达式和过滤器的指令**：
`:class`、`:style`、`:disabled`、`:checked`、`:placeholder`、`:title`、`:html`、`:attr`、`:data`、`if:`、`show:`、`foreach:`

**正确用法**：
```html
<!-- ✅ :text 指令支持表达式和过滤器 -->
<span HeTui :text="price | currency:'¥'"></span>
<span HeTui :text="a > b ? '是' : '否'"></span>

<!-- ✅ :class 指令只使用简单属性 -->
<div HeTui :class|active="flag"></div>

<!-- ❌ :class 指令不支持表达式 -->
<div HeTui :class|active="price > 100"></div>
```

### 事件绑定

```html
<!-- 所有 DOM 事件都支持 -->
<button @click="handler">点击</button>
<input @input="handler" @focus="handler">
<div @mouseover="handler" @mouseout="handler">

<!-- 自定义事件 -->
element.dispatchEvent(new CustomEvent('my-event', { detail: data }));
```

### 事件修饰符

| 修饰符 | 说明 |
|--------|------|
| `.prevent` | 阻止默认行为 |
| `.stop` | 阻止冒泡 |
| `.once` | 只触发一次 |
| `.self` | 仅自身触发 |
| `.ctrl` | 需要 Ctrl 键 |
| `.shift` | 需要 Shift 键 |
| `.alt` | 需要 Alt 键 |
| `.meta` | 需要 Meta 键 |

### 事件参数传递

**⚠️ 重要：框架不支持直接在事件中传递参数**

如果需要在事件处理函数中获取额外参数，通过 `data-*` 属性绑定，然后在方法中从 `event.target` 获取。

#### 基本用法

```html
<!-- 静态值 -->
<button HeTui :data-mode="'split'" @click="setMode">分屏模式</button>

<!-- 动态值 -->
<button HeTui :data-mode="currentMode" @click="setMode">切换模式</button>

<!-- 多个参数 -->
<button HeTui :data-action="'delete'" :data-id="item:id" @click="handleAction">操作</button>
```

#### 方法中获取参数

```javascript
methods: {
    setMode(event, data) {
        // 从 data-* 属性获取参数
        var mode = event.target.getAttribute('data-mode');
        // 或者使用 dataset
        var mode = event.target.dataset.mode;
        console.log('模式:', mode);
    },
    handleAction(event, data) {
        var action = event.target.dataset.action;
        var id = event.target.dataset.id;
        console.log('操作:', action, 'ID:', id);
    }
}
```

#### 复杂场景配合 :data 指令

对于需要绑定复杂对象或嵌套属性的场景，可以使用 `:data` 指令：

```html
<!-- 绑定复杂对象 -->
<button HeTui :data-item="item" @click="deleteItem">删除</button>

<!-- 绑定嵌套属性 -->
<button HeTui :data-user-email="user:email" @click="sendEmail">发邮件</button>
```

#### 使用场景示例

```html
<!-- 列表中的删除按钮 -->
<ul>
    <li HeTui foreach:="users">
        <span HeTui :text="name"></span>
        <button HeTui :data-user-id="id" @click="deleteUser">删除</button>
    </li>
</ul>

<!-- 模式切换 -->
<div HeTui>
    <button HeTui :data-mode="'grid'" @click="switchMode">网格</button>
    <button HeTui :data-mode="'list'" @click="switchMode">列表</button>
</div>
```

```javascript
methods: {
    deleteUser(event, data) {
        var userId = event.target.dataset.userId;
        // 执行删除操作
        console.log('删除用户:', userId);
    },
    switchMode(event, data) {
        var mode = event.target.dataset.mode;
        data.currentMode = mode;
    }
}
```

### 流程控制

```html
<!-- 循环 -->
<li foreach:="items"><span :text="name"></span></li>

<!-- 条件渲染 -->
<div if:="show">内容</div>

<!-- 显示控制 -->
<div show:="visible">内容</div>
```

### 条件取反

`show:` 和 `if:` 指令不支持直接取反语法（如 `show:="!isActive"`），需要通过以下方式实现：

#### 方式1：使用 computed 计算属性

```javascript
var app = new Hetui({
    isActive: Observer.Define(true)
}, container)
.computed({
    isInactive() { return !this.isActive; }
});
```

```html
<div HeTui show:="isActive">激活状态</div>
<div HeTui show:="isInactive">未激活状态</div>
```

#### 方式2：使用两个变量

```javascript
var app = new Hetui({
    isActive: Observer.Define(true),
    isInactive: Observer.Define(false)
}, container);
```

```html
<div HeTui if:="isActive">激活状态</div>
<div HeTui if:="isInactive">未激活状态</div>
```

#### 方式3：在方法中切换状态

```javascript
methods: {
    toggleStatus(event, data) {
        data.isActive = !data.isActive;
    }
}
```

```html
<button HeTui @click="toggleStatus">切换状态</button>
<div HeTui show:="isActive">激活状态</div>
<div HeTui show:="!isActive">未激活状态</div>  <!-- 注意：这种方式不支持 -->
```

## 计算属性与监听器

```javascript
var app = new Hetui({
    price: Observer.Define(100),
    quantity: Observer.Define(2)
}, container)
.computed({
    // 计算属性中访问数据直接使用
    total() { return this.price * this.quantity; }
})
.watch({
    // 监听器自动解包，直接用 newVal
    price(newVal, oldVal) { console.log('价格变化:', newVal); }
});
```

## 过滤器

```html
<span :text="price | currency:'¥'"></span>
<span :text="name | uppercase | truncate:5"></span>
```

内置过滤器：`uppercase`、`lowercase`、`capitalize`、`truncate`、`currency`、`date`、`numberFormat`、`json`、`default`、`length`、`reverse`、`trim`

## 多实例

```javascript
var app1 = new Hetui({...}, document.getElementById('app1'));
var app2 = new Hetui({...}, document.getElementById('app2'));
// 完全独立，互不影响
```

## 常见错误避免

### 错误 1: 混用 Vue.js 语法

```javascript
// ❌ 错误
methods: {
    handler() {
        this.count++;           // this 不指向 app
        this.formData = {};     // 直接赋值不触发更新
    }
}

// ✅ 正确
methods: {
    handler(event, data) {
        data.count++;     // 用 data 参数
        data.formData = {};
    }
}
```

### 错误 2: :value 绑定导致输入问题

```html
<!-- ❌ 错误 - 输入会被框架覆盖 -->
<input :value="username" @input="updateUsername">

<!-- ✅ 正确 - 只用事件处理 -->
<input @input="updateUsername" placeholder="请输入">
```

### 错误 3: :style 使用对象语法或驼峰属性名

```html
<!-- ❌ 错误 - 不支持对象语法 -->
<div :style="{width: (percent * 25) + '%'}">

<!-- ❌ 错误 - 样式名不能用驼峰（浏览器会转全小写） -->
<div :style|backgroundColor="bgColor">
<div :style|fontSize="fontSize">

<!-- ✅ 正确 - 使用 kebab-case 样式名 -->
<div :style|width="progressWidth">
<div :style|background-color="bgColor">
<div :style|font-size="fontSize">
``````

### 错误 4: 嵌套对象用点号访问（所有指令都支持冒号分隔）

**⚠️ 重要：指令格式说明**
- **`:text`、`:value`、`:html` 等数据绑定指令**：使用冒号分隔嵌套路径，如 `:text="user:name"`
- **`:class`、`:style`、`:attr` 等属性绑定指令**：使用竖线分隔参数，如 `:class|active="isActive"`
- **参数与路径的区别**：竖线 `|` 前是参数名（如 `active`、`href`），竖线后等号是数据路径

```html
<!-- ❌ 错误：使用点号 -->
<span :text="user.name"></span>
<input :value="user.email">
<li foreach:="user.items">...</li>
<span :text="errors.password"></span>

<!-- ✅ 正确：使用冒号 -->
<span :text="user:name"></span>
<input :value="user:email">
<li foreach:="user:items">...</li>
<span :text="errors:password"></span>
```

## 流程控制指令

### foreach: 循环指令

遍历数组，为每个元素克隆模板节点：

```html
<ul>
    <li HeTui foreach:="items">
        <span HeTui :text="#index"></span>. 
        <span HeTui :text="#item"></span>
    </li>
</ul>
```

**特殊变量**：
- `#index`: 当前索引（从 1 开始）
- `#item`: 当前数组项（支持原始值和对象）

**示例**：
```javascript
var app = Hetui.Observe({
    fruits: Observer.Define(["苹果", "香蕉", "橙子"])
});
```

## 开发流程

1. **创建 HTML 文件**，引入 hetuimini.js
2. **定义数据**，所有响应式数据用 `Observer.Define()` 包装
3. **编写模板**，使用指令绑定数据，元素加 `HeTui` 属性
4. **实现方法**，方法接收 `(event, data)` 参数
5. **添加计算属性**，访问数据直接使用
6. **测试功能**，确保所有绑定正常工作

## 文件结构建议

```
project/
├── index.html          # 主页面
├── hetuimini.js        # 框架文件
├── components/         # 可选：组件目录
│   ├── header.html
│   └── footer.html
└── README.md
```
