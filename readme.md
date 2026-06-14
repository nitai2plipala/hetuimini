# Hetui Mini

> 轻量级 MVVM 框架，专为 HTML CDN 引入设计，配合 Tailwind CSS 使用

**当前版本**: v1.1.0

## 项目简介

Hetui Mini 是一个轻量级的前端 MVVM 框架，核心目标是**降低 AI 修改前端代码时的认知负担和耦合风险**。

### 解决的问题

传统的前端开发中，数据、视图、逻辑三者深度耦合：
- 修改数据时需要找到对应的 DOM 操作代码
- 修改绑定时需要找到对应的 CSS 选择器
- 修改逻辑时需要找到对应的 HTML 元素

这种耦合导致 AI 在修改代码时容易产生隐藏 bug。

### 解决方案

Hetui Mini 采用**三层分离**架构：

| 层 | 职责 | 修改方式 |
|----|------|----------|
| **数据层** | 状态管理 | 只改数据对象 |
| **指令层** | DOM 绑定 | 只改 HTML 属性 |
| **方法层** | 业务逻辑 | 只改函数 |

**核心优势**：
- 修改任何一层都不会牵连其他层
- AI 可以安全地修改单个层面
- 和 Tailwind CSS "改样式只改 class" 是同一个解耦思想

### 适用场景

- 前端 HTML 项目（CDN 引入）
- 配合 Tailwind CSS 使用
- 需要 AI 辅助开发的场景
- 追求代码可维护性的项目

## 设计理念

**三层分离，各司其职**：

```
┌─────────────┬──────────────────┬─────────────────┐
│   数据 Data │   指令 Directive │   方法 Method    │
├─────────────┼──────────────────┼─────────────────┤
│ 状态管理    │ DOM 绑定声明     │ 业务逻辑        │
│ 改这→视图变 │ 改这→映射变      │ 改这→行为变     │
└─────────────┴──────────────────┴─────────────────┘
```

- **改数据** → 视图自动更新
- **改绑定** → 只改 HTML 指令
- **改逻辑** → 只改方法函数

**关注点完全隔离**：修改任何一层不会牵连其他层，和 Tailwind "改样式只改 class" 是同一个解耦思想。

## AI Agent 技能包

本项目提供了 AI Agent 技能包，用于辅助开发 Hetui Mini 框架应用。

### 技能包位置

```
skills/use-hetuimini/
├── SKILL.md                 # 技能包主文件
├── examples/                # 示例代码
│   └── basic-app.html       # 基础应用示例
└── references/              # 参考文档
    └── quick-reference.md   # 快速参考
```

### 技能包内容

- **SKILL.md**: 技能包主文件，包含框架语法、最佳实践、常见错误避免等完整开发规范
- **examples/**: 示例代码目录，包含基础应用示例
- **references/**: 参考文档目录，包含快速参考文档

### 使用场景

当用户提到以下内容时，可以触发此技能包：
- `hetuimini`、`hetuimini.js`
- 需要创建使用该框架的 HTML 页面
- 框架语法、最佳实践、常见错误避免等

### 技能包功能

1. **框架语法指导**: 提供完整的框架语法说明
2. **最佳实践**: 包含开发最佳实践和常见错误避免
3. **示例代码**: 提供可直接使用的示例代码
4. **快速参考**: 提供指令速查和 API 参考

## 快速开始

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
        }, document.getElementById('app')).methods({
            increment(event, data) {
                data.count++;
            }
        });
    </script>
</body>
</html>
```

## 核心 API

### 创建实例

```javascript
// 方式1：new（推荐）
var app = new Hetui(options, container);

// 方式2：Observe
var app = Hetui.Observe(options, container);
```

### 链式调用

```javascript
var app = new Hetui({
    count: Observer.Define(0)
}, document.getElementById('app'))
.methods({...})      // 添加方法
.computed({...})     // 添加计算属性
.watch({...});       // 添加监听器
```

### Observer.Define vs Observer.Proxy

```javascript
// Observer.Define：用于包装原始值或对象
count: Observer.Define(0)
user: Observer.Define({ name: '张三', age: 25 })

// Observer.Proxy：用于包装对象，支持嵌套属性监听
user: Observer.Proxy({ name: '张三', profile: Observer.Proxy({ city: '北京' }) })

// 两者都可以直接访问属性，无需 .value
data.count++;           // ✅ 直接使用
data.user.name = '新名字';  // ✅ 直接使用
```

### 属性路径语法

使用冒号 `:` 分隔嵌套属性，**所有指令都支持**：

```html
<!-- 单层属性 -->
<span :text="username"></span>

<!-- 嵌套属性（用冒号分隔） -->
<span :text="user:name"></span>
<input :placeholder="placeholders:email">
<span :text="user:profile:email"></span>

<!-- 其他指令也支持冒号分隔路径 -->
<input :value="user:email">
<div :class|active="user:isActive">
<div :style|color="user:theme:color">
<li foreach:="user:items">...</li>
<div if:="user:showModal">...</div>
<div show:="user:isVisible">...</div>
```

**注意**: 不支持点号语法 `user.name`，必须使用冒号 `user:name`

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

## 指令速查

### 数据绑定

| 指令 | 示例 | 说明 |
|------|------|------|
| `:text` | `:text="msg"` | 文本内容 |
| `:value` | `:value="input"` | 表单值（双向） |
| `:attr` | `:attr\|href="url"` | HTML 属性 |
| `:class` | `:class\|active="flag"` 或 `:class="className"` | CSS 类（支持类名字符串绑定） |
| `:style` | `:style\|color="color"` | 内联样式 |
| `:html` | `:html="content"` | HTML 内容 |
| `:data` | `:data="user:id"` | data-* 属性 |
| `:disabled` | `:disabled="flag"` | 禁用状态 |
| `:checked` | `:checked="flag"` | 选中状态 |
| `:placeholder` | `:placeholder="text"` | 占位符 |
| `:title` | `:title="tip"` | 提示文本 |

### 事件绑定

```html
<!-- 所有 DOM 事件都支持 -->
<button @click="handler">点击</button>
<input @input="handler" @focus="handler">
<div @mouseover="handler" @mouseout="handler">
```

### 事件修饰符

| 修饰符 | 说明 | 示例 |
|--------|------|------|
| `.prevent` | 阻止默认 | `@submit.prevent` |
| `.stop` | 阻止冒泡 | `@click.stop` |
| `.once` | 只触发一次 | `@click.once` |
| `.self` | 仅自身触发 | `@click.self` |
| `.ctrl` | Ctrl 键 | `@click.ctrl` |
| `.shift` | Shift 键 | `@click.shift` |
| `.alt` | Alt 键 | `@click.alt` |
| `.meta` | Meta 键 | `@click.meta` |

### 流程控制

```html
<!-- 循环 -->
<li foreach:="items">
    <span :text="#index"></span>. 
    <span :text="#item"></span>
</li>

<!-- 条件渲染 -->
<div if:="show">内容</div>

<!-- 显示控制 -->
<div show:="visible">内容</div>
```

**特殊变量**：
- `#index`: 当前索引（从 1 开始）
- `#item`: 当前数组项（支持原始值和对象）

## 计算属性与监听器

```javascript
var app = Hetui.runApp({
    price: Observer.Define(100),
    quantity: Observer.Define(2)
}, container)
.computed({
    total() { return this.price * this.quantity; }
})
.watch({
    price(newVal, oldVal) { console.log('价格变化:', newVal); }
});
```

## 过滤器

```html
<span :text="price | currency:'¥'"></span>
<span :text="name | uppercase | truncate:5"></span>
```

内置过滤器：`uppercase`、`lowercase`、`capitalize`、`truncate`、`currency`、`date`、`numberFormat`、`json`、`default`、`length`、`reverse`、`trim`

## 自定义事件

```javascript
// 绑定
<div HeTui @my-event="handler">触发</div>

// 触发
element.dispatchEvent(new CustomEvent('my-event', {
    detail: { data: 'value' }
}));
```

## 多实例

```javascript
var app1 = Hetui.runApp({...}, document.getElementById('app1'));
var app2 = Hetui.runApp({...}, document.getElementById('app2'));
// 完全独立，互不影响
```

## 浏览器兼容

支持所有现代浏览器（ES6+）。



## 许可

MIT License
