# Hetui Mini 框架使用文档与指南

> **版本**: 1.1.0  
> **设计理念**: 数据、指令、方法三层分离  
> **适用场景**: 前端 HTML CDN 引入，配合 Tailwind CSS 使用

### 🚫 重要：`.value` 属性已删除

从 v1.0.0 版本开始，`.value` 属性已被完全删除，不再支持。

**旧版写法（已删除）：**
```javascript
data.count.value++;           // ❌ 已删除，会报错
data.user.value.name = '新名字';  // ❌ 已删除，会报错
console.log(data.count.value);  // ❌ 已删除，会报错
```

**新版写法（唯一）：**
```javascript
data.count++;                 // ✅ 唯一写法
data.user.name = '新名字';    // ✅ 唯一写法
console.log(data.count);      // ✅ 唯一写法
```

**说明**：`.value` 属性已被完全删除，必须使用新版的直接访问方式。

---

## 目录

1. [框架概述](#框架概述)
2. [快速开始](#快速开始)
3. [多实例支持](#多实例支持)
4. [核心概念](#核心概念)
   - [响应式数据](#响应式数据)
   - [指令系统](#指令系统)
   - [方法系统](#方法系统)
5. [数据绑定指令](#数据绑定指令)
   - [:text 文本绑定](#text-文本绑定)
   - [:value 值绑定](#value-值绑定)
   - [:attr 属性绑定](#attr-属性绑定)
   - [:class 类绑定](#class-类绑定)
   - [:style 样式绑定](#style-样式绑定)
   - [:disabled 禁用绑定](#disabled-禁用绑定)
   - [:checked 选中绑定](#checked-选中绑定)
   - [:placeholder 占位符绑定](#placeholder-占位符绑定)
   - [:html HTML绑定](#html-html绑定)
6. [事件绑定](#事件绑定)
   - [基本事件](#基本事件)
   - [事件修饰符](#事件修饰符)
7. [流程控制指令](#流程控制指令)
   - [foreach: 循环指令](#foreach-循环指令)
   - [if: 条件渲染](#if-条件渲染)
   - [show: 显示控制](#show-显示控制)
8. [计算属性](#计算属性)
9. [监听器](#监听器)
10. [过滤器系统](#过滤器系统)
   - [内置过滤器](#内置过滤器)
   - [自定义过滤器](#自定义过滤器)
   - [链式过滤器](#链式过滤器)
11. [链式调用 API](#链式调用-api)
12. [完整示例](#完整示例)
13. [最佳实践](#最佳实践)
14. [API 参考](#api-参考)
15. [常见问题](#常见问题)

---

## 框架概述

Hetui Mini 是一个轻量级的 MVVM 框架，核心设计理念是**数据、指令、方法三层分离**：

```
┌─────────────┬──────────────────┬─────────────────┐
│   数据 Data │   指令 Directive │   方法 Method    │
├─────────────┼──────────────────┼─────────────────┤
│ Hetui.Observe│ HTML 属性声明     │ Hetui.xxx       │
│ Observe.Define│ :text :attr @click│ function(){}   │
│ Observe.Proxy │ HeTui 激活       │ 逻辑处理        │
├─────────────┼──────────────────┼─────────────────┤
│ 管状态       │ 管绑定关系        │ 管行为          │
│ 改这→视图自动变│ 改这→重新声明映射  │ 改这→重新定义逻辑│
│ 不碰DOM      │ 不碰JS           │ 不碰数据结构     │
└─────────────┴──────────────────┴─────────────────┘
```

### 核心特性

- **响应式数据绑定**: 修改数据自动更新视图
- **声明式指令系统**: 使用 HTML 属性作为指令
- **事件修饰符**: 支持 `.prevent`、`.stop`、`.once` 等
- **过滤器系统**: 支持数据格式化管道语法
- **计算属性**: 派生数据自动更新
- **监听器**: 监听数据变化执行回调
- **链式调用**: 优雅的 API 设计

---

## 快速开始

### 1. 引入框架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title> Hetui Mini 示例</title>
    <script src="hetuimini.js"></script>
</head>
<body>
    <div id="app">
        <!-- 每个包含指令的元素都必须有 HeTui 属性 -->
        <span HeTui :text="greeting"></span>
    </div>
    
    <script>
        // 必须使用 Observer.Define() 或 Observer.Proxy() 包装属性值
        var app = Hetui.Observe({
            greeting: Observer.Define('Hello Hetui Mini!')
        });
    </script>
</body>
</html>
```

### 2. 重要规则

1. **每个包含指令的元素都必须有 `HeTui` 属性**
2. **必须使用 `Observer.Define()` 或 `Observer.Proxy()` 包装属性值**
3. **字段路径使用冒号 `:` 分隔**（如 `user:name`），所有指令都支持冒号分隔路径

---

## 多实例支持

框架支持创建多个独立的应用实例，每个实例有自己的数据、方法和视图。

### 使用 Hetui.runApp 创建实例

```javascript
// 创建第一个实例
var app1 = Hetui.runApp({
    count: Observer.Define(0),
    message: Observer.Define('应用1的消息')
}, document.getElementById('app1-container')).methods({
    increment(event, data) {
        data.count++;
    }
});

// 创建第二个实例
var app2 = Hetui.runApp({
    count: Observer.Define(10),
    message: Observer.Define('应用2的消息')
}, document.getElementById('app2-container')).methods({
    increment(event, data) {
        data.count += 2;
    }
});
```

### 使用 Hetui.Observe 创建实例

```javascript
// 也可以使用 Hetui.Observe 创建多实例
var app3 = Hetui.Observe({
    count: Observer.Define(100)
}, document.getElementById('app3-container')).methods({
    increment(event, data) {
        data.count += 5;
    }
});
```

### 多实例特性

1. **数据隔离**：每个实例的数据独立，互不影响
2. **方法隔离**：每个实例的方法独立绑定
3. **视图隔离**：通过 `container` 参数指定绑定到哪个 DOM 元素
4. **完全独立**：实例之间没有共享状态

### API 参数说明

```javascript
Hetui.runApp(options, container)
Hetui.Observe(options, container)
```

**参数**：
- `options`：配置对象，包含 `data`、`methods`、`computed`、`watch`
- `container`：DOM 元素，指定绑定范围（可选，如果不提供则绑定到整个文档）

**示例**：
```javascript
// 完整配置
var app = Hetui.runApp({
    data: {
        count: Observer.Define(0)
    },
    methods: {
        increment() { this.count++; }
    },
    computed: {
        doubleCount() { return this.count * 2; }
    },
    watch: {
        count(newVal) { console.log('count changed:', newVal); }
    }
}, document.getElementById('my-app'));
```

---

## 核心概念

### 响应式数据

框架提供两种响应式实现：

#### Observer.Define（基于 Object.defineProperty）

```javascript
var app = Hetui.Observe({
    count: Observer.Define(0),
    user: Observer.Define({
        name: Observer.Define('张三'),
        age: Observer.Define(25)
    })
});

// 修改数据自动触发视图更新
app.count = 1;           // ✅ 视图更新
app.user.name = '李四';   // ✅ 视图更新
```

#### Observer.Proxy（基于 ES6 Proxy）

```javascript
var app = Hetui.Observe({
    items: Observer.Proxy(['商品A', '商品B', '商品C'])
});

// 数组操作自动触发更新
app.items.push('商品D');  // ✅ 视图更新
```

#### 数组响应式支持

框架自动重写以下数组方法以支持响应式更新：
- `push()`, `pop()`, `splice()`
- `shift()`, `unshift()`
- `sort()`, `reverse()`

---

## 数据绑定指令

### :text 文本绑定

将数据绑定到元素的 `textContent`：

```html
<span HeTui :text="greeting"></span>
<span HeTui :text="user:name"></span>
<span HeTui :text="price | currency:'¥'"></span>
```

### :value 值绑定

将数据绑定到表单元素的 `value` 属性（支持双向绑定）：

```html
<input HeTui type="text" :value="username">
<input HeTui type="email" :value="user:email">
```

**双向绑定**: 输入框内容变化会自动更新数据。

### :attr 属性绑定

动态绑定任意 HTML 属性：

```html
<!-- 绑定 href 属性 -->
<a HeTui :attr|href="linkUrl">链接</a>

<!-- 绑定 src 属性 -->
<img HeTui :attr|src="imageUrl" alt="图片">
```

### :data data-* 属性绑定

将数据绑定到元素的 `data-*` 属性，使用冒号分隔的路径会自动转换为连字符：

```html
<!-- 语法: :data="field:subfield" -->
<!-- 生成: data-field-subfield="对应的值" -->

<!-- 绑定用户 ID -->
<div HeTui :data="user:id">用户</div>
<!-- 生成: <div data-user-id="1001"> -->

<!-- 绑定用户名称 -->
<div HeTui :data="user:name">用户</div>
<!-- 生成: <div data-user-name="张三"> -->

<!-- 绑定嵌套属性 -->
<div HeTui :data="user:profile:email">用户</div>
<!-- 生成: <div data-user-profile-email="zhangsan@example.com"> -->
```

**转换规则**：
- 冒号 `:` 转换为连字符 `-`
- 自动添加 `data-` 前缀
- 例如：`user:profile:name` → `data-user-profile-name`

**示例**：

```javascript
var app = Hetui.Observe({
    user: Observer.Define({
        id: Observer.Define(1001),
        name: Observer.Define('张三'),
        profile: Observer.Define({
            email: Observer.Define('zhangsan@example.com')
        })
    })
});
```

```html
<!-- 读取 data-* 属性 -->
<div HeTui :data="user:id" 
     HeTui :data="user:name"
     HeTui :data="user:profile:email">
    用户信息
</div>

<script>
// 读取属性
var element = document.querySelector('[data-user-id]');
console.log(element.dataset.userId);  // "1001"
console.log(element.dataset.userName);  // "张三"
console.log(element.dataset.userProfileEmail);  // "zhangsan@example.com"
</script>
```

### :class 类绑定

根据数据值添加/移除 CSS 类，支持两种模式：

```html
<!-- 模式1：布尔值控制（原有功能） -->
<span HeTui :class|active="isActive">状态文本</span>

<!-- 如果 isActive 为 true，添加 active 类 -->
<!-- 如果 isActive 为 false，移除 active 类 -->

<!-- 模式2：类名字符串绑定（v1.1.0 新功能） -->
<div HeTui :class="stateClass">动态类名绑定</div>

<!-- 根据 stateClass 的值动态设置类名 -->
<!-- 值改变时自动删除旧类名，添加新类名 -->
```

**v1.1.0 新功能**：
- 支持 `:class="className"` 语法，直接绑定类名字符串
- 支持计算属性绑定，可以根据条件返回不同的类名
- 值改变时能正确删除旧类名，添加新类名
- 与原有 `:class|类名="条件"` 语法完全兼容

### :style 样式绑定

动态绑定 CSS 样式属性：

```html
<!-- 绑定颜色 -->
<span HeTui :style|color="fontColor">彩色文本</span>

<!-- 绑定背景色 -->
<div HeTui :style|background="bgColor">背景色块</div>

<!-- 绑定宽度 -->
<div HeTui :style|width="progressPercent">进度条</div>
```

### :disabled 禁用绑定

动态绑定元素的禁用状态：

```html
<input HeTui type="text" :disabled="isDisabled">
<button HeTui :disabled="isSubmitting">提交中...</button>
```

### :checked 选中绑定

动态绑定复选框的选中状态（支持双向绑定）：

```html
<input HeTui type="checkbox" :checked="isAgreed"> 同意协议
<input HeTui type="radio" :checked="selectedOption" value="option1"> 选项1
```

### :placeholder 占位符绑定

动态绑定输入框的占位符文本：

```html
<input HeTui type="text" :placeholder="inputPlaceholder">
<input HeTui type="search" :placeholder="searchPlaceholder">
```

### :title 提示文本绑定

动态绑定元素的 `title` 属性（鼠标悬停提示）：

```html
<!-- 基本用法 -->
<span HeTui :title="tooltipText">鼠标悬停查看提示</span>

<!-- 绑定到按钮 -->
<button HeTui :title="buttonTooltip">按钮</button>

<!-- 绑定到链接 -->
<a HeTui :href="linkUrl" :title="linkTooltip">链接</a>
```

**示例**：

```javascript
var app = Hetui.Observe({
    tooltipText: Observer.Define('这是一个提示信息'),
    buttonTooltip: Observer.Define('点击这个按钮')
});
```

```html
<span HeTui :title="tooltipText">鼠标悬停查看</span>
<button HeTui :title="buttonTooltip">按钮</button>
```

**特点**：
- 支持响应式更新，数据变化时提示文本自动更新
- 适用于所有 HTML 元素
- 常用于表单验证提示、功能说明等场景

### :html HTML绑定

动态绑定元素的 `innerHTML`（注意安全风险）：

```html
<div HeTui :html="htmlContent"></div>
```

**安全说明**: 框架内置了 XSS 防护，会自动过滤以下内容：
- `<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>` 标签
- `on*` 事件属性（如 `onclick`, `onerror`）
- `javascript:`, `data:`, `vbscript:` 协议
- `expression()`, `@import` 等危险代码

### ⚠️ 重要：指令表达式和过滤器支持说明

**不同指令对表达式和过滤器的支持情况不同**：

#### 支持表达式和过滤器的指令
- **`:text`** - 文本绑定指令
  - ✅ 支持表达式：`a > b`、`!(a < b)`、`(a + b) * 2`
  - ✅ 支持过滤器：`price | currency:'¥'`、`name | uppercase`

#### 不支持表达式和过滤器的指令
以下指令**只支持简单的属性路径访问**，**不支持表达式和过滤器**：
- **`:class`** - 类绑定
- **`:style`** - 样式绑定
- **`:disabled`** - 禁用绑定
- **`:checked`** - 选中绑定
- **`:placeholder`** - 占位符绑定
- **`:title`** - 提示文本绑定
- **`:html`** - HTML绑定
- **`:attr`** - 属性绑定
- **`:data`** - data-* 属性绑定
- **`if:`** - 条件指令
- **`show:`** - 显示指令
- **`foreach:`** - 循环指令

**原因**：这些指令使用 `getValueByPath()` 获取值，而 `:text` 指令使用 `evaluateExpression()` 求值表达式。

**示例对比**：
```html
<!-- ✅ 支持：:text 指令 -->
<span HeTui :text="price | currency:'¥'"></span>
<span HeTui :text="a > b ? '是' : '否'"></span>

<!-- ❌ 不支持：:class 指令 -->
<div HeTui :class|active="price > 100"></div>
<div HeTui :class|active="flag | uppercase"></div>

<!-- ✅ 正确用法：:class 指令只使用简单属性 -->
<div HeTui :class|active="isHighPrice"></div>
<div HeTui :class|active="flag"></div>
```

---

## 事件绑定

### 基本事件

使用 `@` 前缀绑定 DOM 事件：

```html
<!-- 点击事件 -->
<button HeTui @click="increment">+1</button>

<!-- 表单提交 -->
<form HeTui @submit="handleLogin">
    <button type="submit">登录</button>
</form>

<!-- 双击事件 -->
<div HeTui @dblclick="handleDblClick">双击我</div>

<!-- 输入事件 -->
<input HeTui type="text" @input="handleInput" @change="handleChange">

<!-- 键盘事件 -->
<input HeTui type="text" @keyup="handleKeyUp" @keydown="handleKeyDown">

<!-- 鼠标事件 -->
<div HeTui @mouseover="handleMouseOver" @mouseout="handleMouseOut">
    鼠标悬停区域
</div>
```

### 支持的事件类型

框架支持所有 DOM 事件，使用 `@事件名` 语法即可绑定：

| 事件类别 | 支持的事件 | 说明 |
|----------|------------|------|
| **鼠标事件** | `@click`, `@dblclick`, `@mouseover`, `@mouseout`, `@mousedown`, `@mouseup`, `@mousemove` | 所有鼠标事件 |
| **键盘事件** | `@keyup`, `@keydown`, `@keypress` | 所有键盘事件 |
| **表单事件** | `@submit`, `@input`, `@change`, `@focus`, `@blur`, `@reset` | 所有表单事件 |
| **触摸事件** | `@touchstart`, `@touchmove`, `@touchend` | 所有触摸事件 |
| **拖拽事件** | `@dragstart`, `@drag`, `@dragend`, `@drop` | 所有拖拽事件 |
| **其他事件** | `@scroll`, `@resize`, `@load`, `@error` | 所有其他事件 |

**事件处理函数查找顺序**：
1. 实例 `methods` 对象（优先）
2. 全局 `Hetui.methods` 对象
3. `data` 数据对象
4. `window` 全局对象

### 事件修饰符

支持以下事件修饰符，可组合使用：

| 修饰符 | 功能 | 示例 |
|--------|------|------|
| `.prevent` | 阻止默认行为 | `@submit.prevent="handler"` |
| `.stop` | 阻止事件冒泡 | `@click.stop="handler"` |
| `.once` | 只触发一次 | `@click.once="handler"` |
| `.self` | 只在目标元素触发 | `@click.self="handler"` |
| `.ctrl` | 需要按下 Ctrl 键 | `@click.ctrl="handler"` |
| `.shift` | 需要按下 Shift 键 | `@click.shift="handler"` |
| `.alt` | 需要按下 Alt 键 | `@click.alt="handler"` |
| `.meta` | 需要按下 Meta 键 | `@click.meta="handler"` |

**示例**：

```html
<!-- 阻止表单默认提交 -->
<form @submit.prevent="handleSubmit">...</form>

<!-- 阻止事件冒泡 -->
<div @click.stop="handleClick">...</div>

<!-- 只触发一次 -->
<button @click.once="handleClick">只点一次</button>

<!-- 组合使用 -->
<form @submit.prevent.stop="handleSubmit">...</form>

<!-- 键盘修饰符：Ctrl + 点击 -->
<button @click.ctrl="handleCtrlClick">Ctrl + 点击</button>

<!-- 鼠标事件修饰符 -->
<div @mouseover.self="handleSelfMouseOver">只在自身触发</div>
```

**所有修饰符都适用于所有事件类型**：

```html
<!-- 鼠标事件 -->
<div @dblclick.stop="handleDblClick">双击阻止冒泡</div>
<div @mousedown.prevent="handleMouseDown">鼠标按下阻止默认</div>

<!-- 表单事件 -->
<input @input.once="handleOnce">只触发一次

<!-- 触摸事件 -->
<div @touchstart.stop="handleTouchStart">触摸开始阻止冒泡</div>

<!-- 拖拽事件 -->
<div @dragstart.prevent="handleDragStart">拖拽开始阻止默认</div>
```

---

## 流程控制指令

### foreach: 循环指令

遍历数组，为每个元素克隆模板节点：

```html
<ul>
    <li HeTui foreach:="items">
        <span HeTui :text="#index"></span>. 
        <span HeTui :text="name"></span> - 
        ¥<span HeTui :text="price"></span>
    </li>
</ul>
```

**特殊变量**：
- `#index`: 当前索引（从 1 开始）
- `#item`: 当前数组项（支持原始值和对象）

**示例**：

```javascript
var app = Hetui.Observe({
    items: Observer.Define([
        { name: '商品A', price: 100 },
        { name: '商品B', price: 200 },
        { name: '商品C', price: 300 }
    ])
});
```

### if: 条件渲染

根据条件决定是否渲染元素：

```html
<div HeTui if:="showModal">
    模态框内容
</div>
```

**说明**: `if:` 指令会在条件为 `false` 时完全移除元素（使用注释节点占位）。

### show: 显示控制

根据条件控制元素的显示/隐藏：

```html
<div HeTui show:="isVisible">
    可见内容
</div>
```

**说明**: `show:` 指令通过 `display: none` 控制元素显示/隐藏，元素始终保留在 DOM 中。

### if: vs show: 对比

| 特性 | if: | show: |
|------|-----|-------|
| DOM 操作 | 移除/插入元素 | 切换 display 属性 |
| 性能 | 条件变化时开销较大 | 切换开销小 |
| 适用场景 | 条件不频繁变化 | 条件频繁切换 |

---

## 计算属性

计算属性是基于其他数据派生的值，会自动缓存：

```javascript
var app = Hetui.Observe({
    price: Observer.Define(100),
    quantity: Observer.Define(2)
}).computed({
    // 计算总价
    totalPrice() {
        return this.price * this.quantity;
    },
    
    // 格式化显示
    totalPriceFormatted() {
        return '¥' + this.totalPrice.toFixed(2);
    }
});
```

```html
<p>总价: <span HeTui :text="totalPriceFormatted"></span></p>
```

**特点**：
- 自动缓存，只有依赖变化时才重新计算
- 支持链式调用添加
- 可以访问 `this` 指向当前数据对象

---

## 监听器

监听数据变化，执行回调函数：

```javascript
var app = Hetui.Observe({
    username: Observer.Define('张三')
}).watch({
    // 监听 username 变化
    username(newVal, oldVal) {
        console.log('用户名变化:', oldVal, '->', newVal);
    }
});
```

**回调参数**：
- `newVal`: 新值
- `oldVal`: 旧值

---

## 过滤器系统

过滤器用于格式化数据，使用管道语法 `|`。

### 语法

```html
<span :text="字段 | 过滤器名"></span>
<span :text="字段 | 过滤器名:参数"></span>
```

### 内置过滤器

| 过滤器 | 功能 | 参数 | 示例 |
|--------|------|------|------|
| `uppercase` | 转大写 | 无 | `:text="text \| uppercase"` |
| `lowercase` | 转小写 | 无 | `:text="text \| lowercase"` |
| `capitalize` | 首字母大写 | 无 | `:text="text \| capitalize"` |
| `truncate` | 截断文本 | 长度, 后缀 | `:text="text \| truncate:10:..."` |
| `currency` | 货币格式化 | 符号, 小数位 | `:text="price \| currency:'¥'"` |
| `date` | 日期格式化 | 格式 | `:text="date \| date:'YYYY-MM-DD'"` |
| `numberFormat` | 千分位格式化 | 小数位 | `:text="num \| numberFormat"` |
| `json` | JSON 格式化 | 缩进 | `:text="obj \| json:2"` |
| `default` | 默认值 | 默认值 | `:text="val \| default:'暂无'"` |
| `length` | 获取长度 | 无 | `:text="arr \| length"` |
| `reverse` | 反转 | 无 | `:text="text \| reverse"` |
| `trim` | 去除空格 | 无 | `:text="text \| trim"` |
| `encodeURIComponent` | URL 编码 | 无 | `:text="url \| encodeURIComponent"` |
| `decodeURIComponent` | URL 解码 | 无 | `:text="url \| decodeURIComponent"` |

### 自定义过滤器

在 `Hetui.filters` 上注册自定义过滤器：

```javascript
// 注册自定义过滤器
Hetui.filters.reverse = function(value) {
    if (typeof value === 'string') {
        return value.split('').reverse().join('');
    }
    return value;
};

Hetui.filters.addPrefix = function(value, prefix) {
    return prefix + value;
};
```

```html
<span :text="text | reverse"></span>
<span :text="name | addPrefix:'Hello, '"></span>
```

### 链式过滤器

支持多个过滤器链式调用：

```html
<!-- 先转大写，再截断 -->
<span :text="text | uppercase | truncate:5"></span>

<!-- 货币格式化，再大写 -->
<span :text="price | currency:'¥' | uppercase"></span>
```

---

## 链式调用 API

框架支持优雅的链式调用：

```javascript
var app = Hetui.Observe({
    // 数据
    count: Observer.Define(0),
    username: Observer.Define('张三')
})
.methods({
    // 方法
    increment() { this.count++; },
    decrement() { this.count--; }
})
.computed({
    // 计算属性
    doubleCount() { return this.count * 2; }
})
.watch({
    // 监听器
    count(newVal, oldVal) {
        console.log('计数器变化:', oldVal, '->', newVal);
    }
});
```

---

## 完整示例

### 示例：待办事项列表

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>待办事项</title>
    <script src="hetuimini.js"></script>
    <style>
        .completed { text-decoration: line-through; color: gray; }
        .active { color: green; font-weight: bold; }
    </style>
</head>
<body>
    <div id="app">
        <h1>待办事项</h1>
        
        <!-- 添加待办事项 -->
        <form HeTui @submit.prevent="addTodo">
            <input HeTui type="text" :value="newTodo" placeholder="输入待办事项">
            <button type="submit">添加</button>
        </form>
        
        <!-- 待办事项列表 -->
        <ul>
            <li HeTui foreach:="todos">
                <label>
                    <input HeTui type="checkbox" :checked="completed">
                    <span HeTui :class|completed="completed" :text="title"></span>
                </label>
                <button HeTui @click="removeTodo">删除</button>
            </li>
        </ul>
        
        <!-- 统计信息 -->
        <p>
            共 <span HeTui :text="totalCount"></span> 项，
            已完成 <span HeTui :text="completedCount"></span> 项
        </p>
    </div>
    
    <script>
        var app = Hetui.Observe({
            newTodo: Observer.Define(''),
            todos: Observer.Define([
                { id: 1, title: '学习 Hetui Mini', completed: false },
                { id: 2, title: '编写文档', completed: true }
            ])
        })
        .methods({
            addTodo(event, data) {
                var title = data.newTodo.trim();
                if (title) {
                    data.todos.push({
                        id: Date.now(),
                        title: title,
                        completed: false
                    });
                    data.newTodo = '';
                }
            },
            removeTodo(event, data, index) {
                data.todos.splice(index - 1, 1);
            }
        })
        .computed({
            totalCount() {
                return this.todos.length;
            },
            completedCount() {
                return this.todos.filter(t => t.completed).length;
            }
        });
    </script>
</body>
</html>
```

---

## 网络请求

框架内置了网络请求模块 `Network`，支持多种请求方式。

### Network.Encoded - 数据编码

将对象编码为查询字符串：

```javascript
// 基本用法
var encoded = Network.Encoded({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com'
});
console.log(encoded);  // "name=%E5%BC%A0%E4%B8%89&age=25&email=zhangsan%40example.com"

// 带 URL 前缀
var url = Network.Encoded({ page: 1, limit: 10 }, '/api/users');
console.log(url);  // "/api/users?page=1&limit=10"

// 带问号前缀
var query = Network.Encoded({ page: 1 }, '');
console.log(query);  // "?page=1"
```

### Network.XHR - XMLHttpRequest 请求

```javascript
// GET 请求
Network.XHR({
    url: '/api/products',
    method: 'GET',
    data: { page: 1, limit: 10 },
    option: {
        responseType: 'json',
        success: function(response) {
            console.log('请求成功:', response);
        },
        error: function(xhr) {
            console.error('请求失败:', xhr.status);
        }
    }
});

// POST 请求（JSON 编码）
Network.XHR({
    url: '/api/orders',
    method: 'POST',
    code: 'json',
    data: {
        productId: 123,
        quantity: 2
    },
    header: {
        'Authorization': 'Bearer token123'
    },
    option: {
        responseType: 'json',
        success: function(response) {
            console.log('订单创建成功:', response);
        }
    }
});

// POST 请求（表单编码）
Network.XHR({
    url: '/api/login',
    method: 'POST',
    code: 'form',
    data: {
        username: 'admin',
        password: '123456'
    },
    option: {
        responseType: 'json',
        success: function(response) {
            console.log('登录成功:', response);
        }
    }
});
```

**配置参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | string | 请求地址 |
| `method` | string | 请求方法（GET/POST等） |
| `data` | object | 请求数据 |
| `code` | string | 编码方式：`'form'`（默认）或 `'json'` |
| `header` | object | 请求头 |
| `async` | boolean | 是否异步（默认 true） |
| `option` | object | 高级选项 |

**option 配置**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `responseType` | string | 响应类型：`'string'`、`'json'`、`'blob'`、`'html'` |
| `success` | function | 成功回调 |
| `error` | function | 失败回调 |

### Network.Form - 表单提交

创建隐藏表单并提交：

```javascript
Network.Form({
    url: '/api/checkout',
    method: 'POST',
    target: '_self',
    data: {
        productId: 123,
        quantity: 2,
        address: '北京市朝阳区'
    }
});
```

**配置参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | string | 提交地址 |
| `method` | string | 请求方法（GET/POST） |
| `target` | string | 目标窗口（`_self`/`_blank`） |
| `data` | object | 表单数据 |

### Network.JsonP - JSONP 跨域请求

```javascript
Network.JsonP({
    url: 'https://api.example.com/data',
    data: { page: 1, limit: 10 }
}, {
    name: 'handleData',
    value: 'callback',
    functor: function(response) {
        console.log('收到数据:', response);
    }
});
```

**参数说明**：

- 第一个参数：包含 `url` 和 `data` 的对象
- 第二个参数：配置对象
  - `name`：注册到 window 的回调函数名
  - `value`：URL 中的回调参数名
  - `functor`：实际的回调处理函数

### Network.Fetch - Fetch API 请求

使用现代浏览器的 Fetch API：

```javascript
// GET 请求
Network.Fetch({
    url: '/api/products',
    method: 'GET',
    data: { page: 1, limit: 10 },
    option: {
        responseType: 'json',
        success: function(data) {
            console.log('请求成功:', data);
        },
        error: function(error) {
            console.error('请求失败:', error);
        },
        complete: function() {
            console.log('请求完成');
        }
    }
});

// POST JSON 请求
Network.Fetch({
    url: '/api/orders',
    method: 'POST',
    code: 'json',
    data: { productId: 123, quantity: 2 },
    header: {
        'Authorization': 'Bearer token123'
    },
    option: {
        responseType: 'json',
        success: function(data) {
            console.log('订单创建成功:', data);
        }
    }
});

// POST 表单请求
Network.Fetch({
    url: '/api/login',
    method: 'POST',
    code: 'form',
    data: { username: 'admin', password: '123456' },
    option: {
        responseType: 'json',
        success: function(data) {
            console.log('登录成功:', data);
        }
    }
});
```

**配置参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | string | 请求地址 |
| `method` | string | 请求方法（GET/POST/PUT/DELETE/PATCH） |
| `data` | object | 请求数据 |
| `code` | string | 编码方式：`'json'`（默认）、`'form'`、`'text'` |
| `header` | object | 请求头 |
| `option` | object | 高级选项 |

**option 配置**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `responseType` | string | 响应类型：`'json'`、`'text'`、`'blob'`、`'arrayBuffer'` |
| `success` | function | 成功回调 |
| `error` | function | 失败回调 |
| `complete` | function | 完成回调（无论成功失败都会执行） |

### 网络请求选择指南

| 场景 | 推荐方式 |
|------|----------|
| 现代浏览器 | `Network.Fetch` |
| 需要兼容 IE | `Network.XHR` |
| 简单表单提交 | `Network.Form` |
| 跨域请求 | `Network.JsonP` |

---

## 最佳实践

### 1. 代码组织

```javascript
// 数据监听使用 Hetui.Observe
var app = Hetui.Observe({
    count: Observer.Define(0),
    user: Observer.Define({ name: '张三' })
});

// 方法定义使用 .methods()
app.methods({
    increment() { this.count++; }
});

// 计算属性使用 .computed()
app.computed({
    doubleCount() { return this.count * 2; }
});
```

### 2. 字段路径使用冒号分隔（所有指令都支持）

```html
<!-- 正确：使用冒号 -->
<span HeTui :text="user:profile:name"></span>
<input HeTui :value="user:email">
<div HeTui :class|active="user:isActive">
<li HeTui foreach:="user:items">...</li>

<!-- 错误：使用点号 -->
<span :text="user.profile.name"></span>
```

### 3. 每个指令元素必须有 HeTui 属性

```html
<!-- 正确 -->
<span HeTui :text="message"></span>

<!-- 错误：缺少 HeTui 属性 -->
<span :text="message"></span>
```

### 4. 优先使用 :value 双向绑定

```html
<!-- 推荐：使用 :value 双向绑定 -->
<input HeTui type="text" :value="username">

<!-- 不推荐：手动处理 input 事件 -->
<input type="text" @input="updateUsername">
```

### 5. 合理使用计算属性

```javascript
// 推荐：使用计算属性
.computed({
    fullName() {
        return this.firstName + ' ' + this.lastName;
    }
})

// 不推荐：在模板中拼接
// <span :text="firstName + ' ' + lastName"></span>
```

---

## API 参考

### Hetui 全局对象

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `Hetui.Observe(options, container)` | Function | 初始化响应式数据（支持多实例） |
| `Hetui.runApp(options, container)` | Function | 创建应用实例（推荐用于多实例） |
| `Hetui.initView(data)` | Function | 初始化视图 |
| `Hetui.methods` | Object | 方法对象 |
| `Hetui.filters` | Object | 过滤器对象 |
| `Hetui.version` | String | 框架版本 |

### Observer 对象

| 方法 | 说明 |
|------|------|
| `Observer.Define(value)` | 创建响应式对象（基于 defineProperty） |
| `Observer.Proxy(value)` | 创建响应式对象（基于 ES6 Proxy） |

### Hetui.runApp 方法

创建应用实例，支持多实例开发：

```javascript
var app = Hetui.runApp(options, container)
```

**参数**：
- `options`：配置对象，支持以下格式：
  ```javascript
  // 简洁格式
  {
      fieldName: Observer.Define(value),
      methodName: function() {}
  }
  
  // 完整格式
  {
      data: { fieldName: Observer.Define(value) },
      methods: { methodName: function() {} },
      computed: { computedName: function() {} },
      watch: { fieldName: function(newVal, oldVal) {} }
  }
  ```
- `container`：DOM 元素，指定绑定范围（可选）

**返回值**：数据对象，支持链式调用

**示例**：
```javascript
var app = Hetui.runApp({
    count: Observer.Define(0),
    message: Observer.Define('hello')
}, document.getElementById('app')).methods({
    increment() { this.count++; }
}).computed({
    doubleCount() { return this.count * 2; }
});
```

### 链式方法

| 方法 | 说明 |
|------|------|
| `.methods(obj)` | 添加方法 |
| `.computed(obj)` | 添加计算属性 |
| `.watch(obj)` | 添加监听器 |

### 指令速查表

| 指令 | 语法 | 说明 |
|------|------|------|
| `:text` | `:text="field"` | 文本绑定 |
| `:value` | `:value="field"` | 值绑定（双向） |
| `:attr` | `:attr\|attrName="field"` | 属性绑定 |
| `:data` | `:data="field:subfield"` | data-* 属性绑定 |
| `:class` | `:class\|className="field"` | 类绑定 |
| `:style` | `:style\|styleName="field"` | 样式绑定 |
| `:disabled` | `:disabled="field"` | 禁用绑定 |
| `:checked` | `:checked="field"` | 选中绑定（双向） |
| `:placeholder` | `:placeholder="field"` | 占位符绑定 |
| `:title` | `:title="field"` | 提示文本绑定 |
| `:html` | `:html="field"` | HTML绑定 |
| `@click` | `@click="handler"` | 点击事件（独立处理） |
| `@submit` | `@submit="handler"` | 提交事件（独立处理） |
| `@xxx` | `@事件名="handler"` | 所有其他 DOM 事件（统一处理） |
| `foreach:` | `foreach:="field"` | 循环指令 |
| `if:` | `if:="field"` | 条件渲染 |
| `show:` | `show:="field"` | 显示控制 |

**@xxx 事件指令示例**：

| 事件类别 | 指令示例 | 说明 |
|----------|----------|------|
| 鼠标事件 | `@dblclick`, `@mouseover`, `@mouseout`, `@mousedown`, `@mouseup` | 所有鼠标事件 |
| 键盘事件 | `@keyup`, `@keydown`, `@keypress` | 所有键盘事件 |
| 表单事件 | `@input`, `@change`, `@focus`, `@blur`, `@reset` | 所有表单事件 |
| 触摸事件 | `@touchstart`, `@touchmove`, `@touchend` | 所有触摸事件 |
| 拖拽事件 | `@dragstart`, `@drag`, `@dragend`, `@drop` | 所有拖拽事件 |
| 其他事件 | `@scroll`, `@resize`, `@load`, `@error` | 所有其他事件 |

### 事件修饰符

| 修饰符 | 说明 |
|--------|------|
| `.prevent` | 阻止默认行为 |
| `.stop` | 阻止冒泡 |
| `.once` | 只触发一次 |
| `.self` | 只在目标元素触发 |
| `.ctrl` | 需要 Ctrl 键 |
| `.shift` | 需要 Shift 键 |
| `.alt` | 需要 Alt 键 |
| `.meta` | 需要 Meta 键 |

---

## 常见问题

### Q1: 为什么我的数据变化没有触发视图更新？

**A**: 确保使用 `Observer.Define()` 或 `Observer.Proxy()` 包装属性值：

```javascript
// ❌ 错误：直接赋值不会触发更新
var app = Hetui.Observe({
    count: 0
});

// ✅ 正确：使用 Observer.Define 包装
var app = Hetui.Observe({
    count: Observer.Define(0)
});
```

### Q2: 为什么指令没有生效？

**A**: 确保元素有 `HeTui` 属性：

```html
<!-- ❌ 错误：缺少 HeTui 属性 -->
<span :text="message"></span>

<!-- ✅ 正确：有 HeTui 属性 -->
<span HeTui :text="message"></span>
```

### Q3: 如何监听数组变化？

**A**: 框架已自动重写数组方法，直接使用即可：

```javascript
var app = Hetui.Observe({
    items: Observer.Define([1, 2, 3])
});

// 这些操作都会触发视图更新
app.items.push(4);      // ✅
app.items.pop();        // ✅
app.items.splice(0, 1); // ✅
```

### Q4: 计算属性和监听器的区别？

**A**: 
- **计算属性**: 用于派生数据，自动缓存，适合模板中显示
- **监听器**: 用于执行副作用（如日志、网络请求），在数据变化时触发

### Q5: :html 指令安全吗？

**A**: 框架内置了 XSS 防护，会过滤危险标签和属性。但仍建议：
1. 尽量避免使用 `:html`
2. 只插入可信内容
3. 在服务端进行数据验证

---

## 更新日志

### v1.1.0 (2026-06-07)

- **新增 `:class` 指令增强**：支持类名字符串绑定，语法 `:class="className"`
- **计算属性支持**：`:class` 指令现在支持计算属性绑定
- **条件切换**：可以根据条件动态切换不同的类名
- **向后兼容**：原有 `:class|类名="条件"` 语法继续工作

### v1.0.0 (2026-06-06)

- **重大更新：完全移除 `.value` 属性**
  - Observer.Define 和 Observer.Proxy 返回的响应式对象不再支持 `.value` 访问
  - 必须使用直接访问方式：`data.count` 而不是 `data.count.value`
  - 内部使用 `_value` 存储实际值（不暴露给用户）
- **新增自动解包机制**
  - 响应式对象自动解包为原始值，无需手动访问 `.value`
  - 支持所有嵌套级别的自动解包
- **新增 data 对象 Proxy 包装**
  - data 对象自动用 Proxy 包装，拦截赋值操作
  - 支持 `data.step1 = false` 语法直接触发响应式更新
- **新增 Symbol(Symbol.toPrimitive) 支持**
  - 响应式对象可以正确转换为原始值
  - 支持数学运算、字符串拼接等操作
- **修复 Observer.Define set 拦截器**
  - 当 `_value` 是原始值时，直接替换 `_value` 并触发更新
- **修复 _addWatch 方法**
  - 移除旧版 `.value` 访问方式
- **修复 setData 方法**
  - 设置 `_value` 属性而不是直接赋值

### v0.3.0 (2026-06-02)

- **新增统一事件处理**：支持所有 DOM 事件的 `@xxx` 语法
- **保持 `@click`、`@submit` 独立处理**：优化性能，向后兼容
- **支持所有事件修饰符**：`.prevent`、`.stop`、`.once`、`.self`、`.ctrl`、`.shift`、`.alt`、`.meta`
- **支持所有事件类型**：鼠标、键盘、表单、触摸、拖拽等所有 DOM 事件

### v0.2.0 (2026-06-02)

- **新增多实例支持**：可以创建多个独立的应用实例
- **新增 `Hetui.runApp` 工厂函数**：推荐用于多实例开发
- **优化 `container` 参数**：作为第二个参数传递，API 更简洁
- **修复 `getValueByPath` 函数**：正确处理嵌套的响应式对象
- **修复 `bindData` 函数**：正确生成 data-* 属性名
- **优化事件处理函数查找**：优先从实例 methods 中查找

### v0.1.0 (2026-06-02)

- 初始版本发布
- 支持 Observer.Define 和 Observer.Proxy 响应式系统
- 支持 16 种指令
- 支持事件修饰符
- 支持过滤器系统
- 支持计算属性和监听器
- 支持链式调用 API
- 支持网络请求（XHR、Form、JsonP、Fetch）

#### 新增指令
- `:text` 文本绑定
- `:value` 值绑定（双向）
- `:attr` 属性绑定
- `:data` data-* 属性绑定
- `:class` 类绑定
- `:style` 样式绑定
- `:disabled` 禁用绑定
- `:checked` 选中绑定（双向）
- `:placeholder` 占位符绑定
- `:title` 提示文本绑定
- `:html` HTML绑定（带安全防护）
- `@click` 点击事件
- `@submit` 提交事件
- `foreach:` 循环指令
- `if:` 条件渲染
- `show:` 显示控制

#### 事件修饰符
- `.prevent` 阻止默认行为
- `.stop` 阻止冒泡
- `.once` 只触发一次
- `.self` 只在目标元素触发
- `.ctrl` 需要 Ctrl 键
- `.shift` 需要 Shift 键
- `.alt` 需要 Alt 键
- `.meta` 需要 Meta 键

#### 内置过滤器
- `uppercase`, `lowercase`, `capitalize`
- `truncate`, `currency`, `date`
- `numberFormat`, `json`, `default`
- `length`, `reverse`, `trim`
- `encodeURIComponent`, `decodeURIComponent`

---

## 许可证

MIT License