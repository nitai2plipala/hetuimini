# Hetui Mini 快速参考

## 创建应用

```javascript
// 基本创建
var app = new Hetui({
    fieldName: Observer.Define(initialValue)
}, document.getElementById('container'));

// 链式调用
var app = new Hetui({...}, container)
.methods({...})
.computed({...})
.watch({...});
```

## 数据操作

```javascript
// 读取值
var value = data.fieldName;

// 写入值
data.fieldName = newValue;

// 嵌套对象
data.user.name = '新名字';
```

## 方法模板

```javascript
methods: {
    // 基本方法
    handleclick(event, data) {
        data.count++;
    },
    
    // 表单处理
    handleSubmit(event, data) {
        event.preventDefault();
        var formData = data.formData;
        // 处理表单...
    },
    
    // 带参数
    deleteItem(event, data, itemId) {
        // 删除逻辑...
    }
}
```

## 计算属性模板

```javascript
computed: {
    // 简单计算
    totalPrice() {
        return this.price * this.quantity;
    },
    
    // 条件判断
    canSubmit() {
        return this.username && this.password;
    },
    
    // 格式化
    formattedPrice() {
        return '¥' + this.price.toFixed(2);
    }
}
```

## 监听器模板

```javascript
watch: {
    // 基本监听
    username(newVal, oldVal) {
        console.log('用户名变化:', oldVal, '->', newVal);
    },
    
    // 嵌套对象监听
    'user.name'(newVal, oldVal) {
        // 处理变化...
    }
}
```

## 常用指令示例

```html
<!-- 文本绑定 -->
<span :text="message"></span>

<!-- 双向绑定（输入框） -->
<input @input="updateField" placeholder="请输入">

<!-- 条件显示 -->
<div if:="showModal">模态框内容</div>
<div show:="isVisible">可见内容</div>

<!-- 循环 -->
<li foreach:="items">
    <span :text="#index"></span>. 
    <span :text="#item"></span>
</li>

<!-- 事件 -->
<button @click="handler">点击</button>
<form @submit.prevent="handleSubmit">提交</form>

<!-- 样式 -->
<div :class|active="isActive">内容</div>
<div :style|color="textColor">彩色文本</div>

<!-- 冒号分隔路径（所有指令都支持） -->
<span :text="user:name"></span>
<input :value="user:email">
<div :class|active="user:isActive">
<div :style|color="user:theme:color">
<li foreach:="user:items">...</li>
<div if:="user:showModal">...</div>
<div show:="user:isVisible">...</div>
```

## 过滤器示例

```html
<!-- 货币格式化 -->
<span :text="price | currency:'¥'"></span>

<!-- 大写 -->
<span :text="name | uppercase"></span>

<!-- 截断 -->
<span :text="longText | truncate:10"></span>

<!-- 链式 -->
<span :text="name | uppercase | truncate:5"></span>

<!-- 默认值 -->
<span :text="emptyValue | default:'暂无'"></span>
```

## 自定义事件

```javascript
// 触发自定义事件
element.dispatchEvent(new CustomEvent('my-event', {
    bubbles: true,
    detail: { data: 'value' }
}));

// 监听自定义事件
<div HeTui @my-event="handleCustomEvent">
```

## 表单处理模式

```html
<form HeTui @submit.prevent="handleSubmit">
    <input HeTui @input="updateEmail" placeholder="邮箱">
    <input HeTui @input="updatePassword" type="password" placeholder="密码">
    <button type="submit">提交</button>
</form>

<script>
var app = new Hetui({
    email: Observer.Define(''),
    password: Observer.Define('')
}, container)
.methods({
    updateEmail(event, data) {
        data.email = event.target.value;
    },
    updatePassword(event, data) {
        data.password = event.target.value;
    },
    handleSubmit(event, data) {
        event.preventDefault();
        console.log('提交:', data.email, data.password);
    }
});
</script>
```

## 列表操作模式

```html
<ul HeTui foreach:="items">
    <li>
        <span :text="name"></span>
        <span :text="price"></span>
        <button @click="deleteItem">删除</button>
    </li>
</ul>
<button @click="addItem">添加</button>

<script>
var app = new Hetui({
    items: Observer.Define([
        { name: '商品A', price: 100 },
        { name: '商品B', price: 200 }
    ])
}, container)
.methods({
    addItem(event, data) {
        data.items.push({
            name: '新商品',
            price: 0
        });
    },
    deleteItem(event, data, index) {
        data.items.splice(index, 1);
    }
});
</script>
```
