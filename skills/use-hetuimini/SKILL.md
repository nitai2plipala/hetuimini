---
name: use-hetuimini
description: |
  使用 hetuimini.js 轻量级 MVVM 框架开发前端应用的完整指南。当用户提到 hetuimini、hetuimini.js、或需要创建使用该框架的 HTML 页面时触发此技能。包含框架语法、最佳实践、常见错误避免等完整开发规范。
---

# Hetui Mini 框架开发指南

### 🚫 重要：`.value` 属性已删除

从 v1.0.0 版本开始，`.value` 属性已被完全删除，不再支持。

### 🆕 v1.1.0 新功能
- **`:class` 指令增强**：支持类名字符串绑定，语法 `:class="className"`
- **计算属性支持**：`:class` 指令现在支持计算属性绑定
- **条件切换**：可以根据条件动态切换不同的类名
- **向后兼容**：原有 `:class|类名="条件"` 语法继续工作

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
        var app = Hetui.runApp({
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

### 1. 响应式数据必须用 Observer.Define 或 Observer.Proxy 包装

```javascript
// ✅ 正确：Observer.Define
var app = Hetui.runApp({
    count: Observer.Define(0),
    user: Observer.Define({ name: '张三' })
}, container);

// ✅ 正确：Observer.Proxy（支持嵌套属性监听）
var app = Hetui.runApp({
    user: Observer.Proxy({ 
        name: '张三',
        profile: Observer.Proxy({ city: '北京' })
    })
}, container);

// ❌ 错误 - 不会触发视图更新
var app = Hetui.runApp({
    count: 0,
    user: { name: '张三' }
}, container);
```

### 2. 访问响应式数据直接使用

```javascript
// ✅ 正确
console.log(data.count);  // 读取
data.count = 10;          // 写入

// ❌ 错误 - 旧版写法（已删除）
console.log(data.count.value);  // 已删除，会报错
data.count.value = 10;          // 已删除，会报错
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

## 响应式对象内部结构（v1.0.0+）

**⚠️ 重要：`@Hetui::observer` 属性的值已更新**

### 新版结构（v1.0.0+）
```javascript
// 响应式对象结构
{
  '@Hetui::observer': {      // 标记属性，值为内部状态对象
    dep: Set(),              // 依赖集合
    methods: {},             // 方法对象（仅根对象）
    computedFns: {},         // 计算属性函数（仅根对象）
    watchFns: {},            // 监听器函数（仅根对象）
    _computedUpdaters: [],   // computed 更新函数数组（仅根对象）
    _app: App               // App 实例引用（仅根对象）
  },
  'value': 1,               // 实际值（仅原始值）
  // ... 其他属性（对象类型）
}
```

### 为什么使用访问器（getter/setter）

1. **防止意外修改**：setter 为空函数，确保 `@Hetui::observer` 不会被改变
2. **不可枚举**：`enumerable: false` 确保不会出现在 `for...in` 循环中
3. **不可配置**：`configurable: false` 确保属性不能被删除或重新配置
4. **性能优化**：返回固定的对象引用，避免每次访问都创建新对象

### 使用说明
1. **检测响应式对象**：检查对象是否有 `@Hetui::observer` 属性
2. **访问依赖集合**：通过 `obj['@Hetui::observer'].dep` 获取
3. **内部机制**：框架自动管理依赖收集和更新，无需手动操作
4. **根对象也有标记**：`self.data` 也有 `@Hetui::observer` 属性，保持一致性
5. **数据清晰**：所有内部属性（methods、computed、watch 等）都存储在 `@Hetui::observer` 中，用户数据保持纯净
6. **链式调用保持**：链式方法函数（`methods`、`computed`、`watch`）同时存储在 `@Hetui::observer` 和根对象上，保持 `app.methods({...}).computed({...})` 链式调用

### 示例
```javascript
// 创建响应式对象
var count = Observer.Define(0);

// 检查是否为响应式对象
console.log(count['@Hetui::observer']);  // { dep: Set(0) }

// 身份比较（每次访问返回相同对象）
var a = count['@Hetui::observer'];
var b = count['@Hetui::observer'];
console.log(a === b);  // true，固定对象引用

// 依赖集合自动管理：
// 1. 读取数据时自动收集依赖
// 2. 修改数据时自动触发更新

// 根对象也有 @Hetui::observer 标记
var app = Hetui.Observe({
    count: Observer.Define(0)
}, container);
console.log(app['@Hetui::observer']);  // { dep: Set(0) }
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

### 流程控制

```html
<!-- 循环 -->
<li foreach:="items"><span :text="name"></span></li>

<!-- 条件渲染 -->
<div if:="show">内容</div>

<!-- 显示控制 -->
<div show:="visible">内容</div>
```

## 计算属性与监听器

```javascript
var app = Hetui.runApp({
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
var app1 = Hetui.runApp({...}, document.getElementById('app1'));
var app2 = Hetui.runApp({...}, document.getElementById('app2'));
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

### 错误 3: :style 使用对象语法

```html
<!-- ❌ 错误 - 不支持对象语法 -->
<div :style="{width: (percent * 25) + '%'}">

<!-- ✅ 正确 - 使用 computed 属性 -->
<div :style|width="progressWidth">
```

### 错误 4: 嵌套对象用点号访问（所有指令都支持冒号分隔）

**⚠️ 重要：指令格式说明**
- **`:text`、`:value`、`:html` 等数据绑定指令**：使用冒号分隔嵌套路径，如 `:text="user:name"`
- **`:class`、`:style`、`:attr` 等属性绑定指令**：使用竖线分隔参数，如 `:class|active="isActive"`
- **不再支持旧格式**：`:class="active:isActive"`、`:style="color:fontColor"`、`:attr="href:linkUrl"` 已删除

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
