/**
 * Hetui Mini - 轻量级 MVVM 框架
 * 核心设计：数据、指令、方法三层分离
 * 版本：1.0.0
 */

(function() {
    'use strict';
    
    // 全局对象
    var Hetui = {
        version: '1.1.1',
        data: null, // 响应式数据对象
        methods: {}, // 方法对象
        filters: {}, // 过滤器对象
        depMap: new Map(), // 依赖映射：key -> Set<updateFn>
        elements: new Map() // 元素映射：element -> Set<directive>
    };
    
    // 观察者系统
    var Observer = {
        /**
         * 基于 Object.defineProperty 的响应式
         * @param {*} initialValue 初始值
         * @returns {Object} 响应式对象
         */
        Define: function(initialValue) {
            // 如果已经是响应式对象，直接返回
            if (initialValue && initialValue['@Hetui::observer']) {
                return initialValue;
            }
            
            // 如果是数组
            if (Array.isArray(initialValue)) {
                return this._defineArray(initialValue);
            }
            
            // 如果是对象
            if (initialValue !== null && typeof initialValue === 'object') {
                return this._defineObject(initialValue);
            }
            
            // 原始值
            return this._definePrimitive(initialValue);
        },
        
        /**
         * 为对象创建响应式
         */
        _defineObject: function(obj) {
            var self = this;
            var dep = new Set(); // 依赖集合
            var reactiveObj = {};
            
            // 标记为响应式对象，同时存储依赖集合
            var observerObj = { dep: dep };
            Object.defineProperty(reactiveObj, '@Hetui::observer', {
                get: function() { return observerObj; },
                set: function() {},
                enumerable: false,
                configurable: false
            });
            
            // 遍历对象的每个属性
            Object.keys(obj).forEach(function(key) {
                var value = obj[key];
                
                // 如果属性值也是对象，递归创建响应式
                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    reactiveObj[key] = self._defineObject(value);
                } else if (Array.isArray(value)) {
                    reactiveObj[key] = self._defineArray(value);
                } else {
                    // 原始值，创建响应式属性
                    var childDep = new Set();
                    
                    (function(key, value, childDep) {
                        Object.defineProperty(reactiveObj, key, {
                            get: function() {
                                // 收集依赖
                                if (Observer._currentDep) {
                                    childDep.add(Observer._currentDep);
                                }
                                return value;
                            },
                            set: function(newValue) {
                                if (value !== newValue) {
                                    value = newValue;
                                    // 通知更新
                                    childDep.forEach(function(updateFn) {
                                        updateFn();
                                    });
                                    dep.forEach(function(updateFn) {
                                        updateFn();
                                    });
                                    // 触发 computed 更新
                                    if (reactiveObj['@Hetui::observer'] && reactiveObj['@Hetui::observer']._computedUpdaters) {
                                        reactiveObj['@Hetui::observer']._computedUpdaters.forEach(function(updateFn) {
                                            updateFn();
                                        });
                                    }
                                }
                            },
                            enumerable: true,
                            configurable: true
                        });
                    })(key, value, childDep);
                }
            });
            
            return reactiveObj;
        },
        
        /**
         * 为数组创建响应式
         */
        _defineArray: function(arr) {
            var dep = new Set(); // 依赖集合
            var self = this;
            
            // 创建响应式数组
            var reactiveArr = [];
            
            // 标记为响应式对象，同时存储依赖集合
            var observerObj = { dep: dep };
            Object.defineProperty(reactiveArr, '@Hetui::observer', {
                get: function() { return observerObj; },
                set: function() {},
                enumerable: false,
                configurable: false
            });
            
            // 遍历数组元素
            arr.forEach(function(item, index) {
                if (item !== null && typeof item === 'object') {
                    reactiveArr[index] = self._defineObject(item);
                } else {
                    var itemDep = new Set();
                    
                    (function(index, item, itemDep) {
                        Object.defineProperty(reactiveArr, index, {
                            get: function() {
                                if (Observer._currentDep) {
                                    itemDep.add(Observer._currentDep);
                                }
                                return item;
                            },
                            set: function(newValue) {
                                if (item !== newValue) {
                                    item = newValue;
                                    itemDep.forEach(function(updateFn) {
                                        updateFn();
                                    });
                                    dep.forEach(function(updateFn) {
                                        updateFn();
                                    });
                                    if (reactiveArr['@Hetui::observer'] && reactiveArr['@Hetui::observer']._computedUpdaters) {
                                        reactiveArr['@Hetui::observer']._computedUpdaters.forEach(function(updateFn) {
                                            updateFn();
                                        });
                                    }
                                }
                            },
                            enumerable: true,
                            configurable: true
                        });
                    })(index, item, itemDep);
                }
            });
            
            // 重写数组方法
            var originalPush = Array.prototype.push;
            var originalPop = Array.prototype.pop;
            var originalSplice = Array.prototype.splice;
            var originalShift = Array.prototype.shift;
            var originalUnshift = Array.prototype.unshift;
            var originalSort = Array.prototype.sort;
            var originalReverse = Array.prototype.reverse;
            
            var triggerUpdate = function() {
                dep.forEach(function(updateFn) {
                    updateFn();
                });
                if (reactiveArr['@Hetui::observer'] && reactiveArr['@Hetui::observer']._computedUpdaters) {
                    reactiveArr['@Hetui::observer']._computedUpdaters.forEach(function(updateFn) {
                        updateFn();
                    });
                }
            };
            
            reactiveArr.push = function() {
                var result = originalPush.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            reactiveArr.pop = function() {
                var result = originalPop.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            reactiveArr.splice = function() {
                var result = originalSplice.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            reactiveArr.shift = function() {
                var result = originalShift.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            reactiveArr.unshift = function() {
                var result = originalUnshift.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            reactiveArr.sort = function() {
                var result = originalSort.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            reactiveArr.reverse = function() {
                var result = originalReverse.apply(this, arguments);
                triggerUpdate();
                return result;
            };
            
            return reactiveArr;
        },
        
        /**
         * 为原始值创建响应式
         */
        _definePrimitive: function(initialValue) {
            var dep = new Set(); // 依赖集合
            var value = initialValue; // 闭包存储值
            
            var obj = {};
            
            // 标记为响应式对象，同时存储依赖集合
            var observerObj = { dep: dep };
            Object.defineProperty(obj, '@Hetui::observer', {
                get: function() { return observerObj; },
                set: function() {},
                enumerable: false,
                configurable: false
            });
            
            // 创建 value 属性
            Object.defineProperty(obj, 'value', {
                get: function() {
                    // 收集依赖
                    if (Observer._currentDep) {
                        dep.add(Observer._currentDep);
                    }
                    return value;
                },
                set: function(newValue) {
                    if (value !== newValue) {
                        value = newValue;
                        // 通知更新
                        dep.forEach(function(updateFn) {
                            updateFn();
                        });
                        // 触发 computed 更新
                        if (obj['@Hetui::observer'] && obj['@Hetui::observer']._computedUpdaters) {
                            obj['@Hetui::observer']._computedUpdaters.forEach(function(updateFn) {
                                updateFn();
                            });
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            
            return obj;
        },
        
        // 当前正在收集依赖的函数
        _currentDep: null,
        
        /**
         * 开始收集依赖
         */
        startDep: function(updateFn) {
            this._currentDep = updateFn;
        },
        
        /**
         * 结束收集依赖
         */
        endDep: function() {
            this._currentDep = null;
        }
    };
    
    // App 类 - 支持多实例
    var App = function(options, container) {
        this.id = 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.data = {};
        this._elements = new Map();
        this._initialized = false;
        
        // 存储容器元素
        this._container = container || null;
        
        this._init(options);
    };
    
    App.prototype = {
        _init: function(options) {
            var self = this;
            var dataObj = options.data || options;
            var methods = options.methods || {};
            var computedFns = options.computed || {};
            var watchFns = options.watch || {};
            
            // 处理数据
            var rawData = {};
            Object.keys(dataObj).forEach(function(key) {
                var value = dataObj[key];
                
                // 跳过方法（函数）
                if (typeof value === 'function' && !value['@Hetui::observer']) {
                    methods[key] = value;
                    return;
                }
                
                // 检查是否是响应式声明
                if (typeof value === 'function' && value['@Hetui::observer']) {
                    rawData[key] = value.call(self);
                } else {
                    rawData[key] = value;
                }
            });
            
            // 使用 Object.defineProperty 包装 data，拦截赋值操作以支持 data.step1 = false 语法
            var reactiveData = {};
            Object.keys(rawData).forEach(function(key) {
                var value = rawData[key];
                
                // 检查是否是响应式对象（有 @Hetui::observer 和 value 属性）
                if (value && value['@Hetui::observer'] && value.hasOwnProperty('value')) {
                    // 响应式对象：getter 返回 value，setter 设置 value
                    (function(key, value) {
                        Object.defineProperty(reactiveData, key, {
                            get: function() {
                                // 收集依赖
                                if (Observer._currentDep) {
                                    value['@Hetui::observer'].dep.add(Observer._currentDep);
                                }
                                return value.value;
                            },
                            set: function(newValue) {
                                // 设置响应式对象的 value，会触发该对象的依赖更新
                                value.value = newValue;
                            },
                            enumerable: true,
                            configurable: true
                        });
                    })(key, value);
                } else {
                    // 普通值：直接读写
                    (function(key, value) {
                        Object.defineProperty(reactiveData, key, {
                            get: function() {
                                return value;
                            },
                            set: function(newValue) {
                                value = newValue;
                            },
                            enumerable: true,
                            configurable: true
                        });
                    })(key, value);
                }
            });
            self.data = reactiveData;
            
            // 给根对象添加 @Hetui::observer 标记，保持一致性
            var rootDep = new Set();
            var rootObserverObj = { 
                dep: rootDep,
                methods: {},
                computedFns: {},
                watchFns: {},
                _computedUpdaters: [],
                _app: self
            };
            Object.defineProperty(self.data, '@Hetui::observer', {
                get: function() { return rootObserverObj; },
                set: function() {},
                enumerable: false,
                configurable: false
            });
            
            // 处理方法 - 存储到 @Hetui::observer 中
            Object.keys(methods).forEach(function(key) {
                rootObserverObj.methods[key] = methods[key];
            });
            
            // 处理 computed 计算属性 - 存储到 @Hetui::observer 中
            Object.keys(computedFns).forEach(function(key) {
                rootObserverObj.computedFns[key] = computedFns[key];
            });
            
            // 处理 watch 监听器 - 存储到 @Hetui::observer 中
            Object.keys(watchFns).forEach(function(key) {
                rootObserverObj.watchFns[key] = watchFns[key];
            });
            
            // 延迟初始化视图
            setTimeout(function() {
                self.initView();
            }, 0);
        },
        
        _addComputed: function(key, computeFn) {
            var self = this;
            var dep = new Set();
            var cachedValue = undefined;
            
            function updateComputed() {
                Observer.startDep(updateComputed);
                var newValue = computeFn.call(self.data);
                Observer.endDep();
                
                if (cachedValue !== newValue) {
                    cachedValue = newValue;
                    dep.forEach(function(fn) { fn(); });
                }
            }
            
            Object.defineProperty(self.data, key, {
                get: function() {
                    if (Observer._currentDep) {
                        dep.add(Observer._currentDep);
                    }
                    return cachedValue;
                },
                enumerable: true,
                configurable: true
            });
            
            updateComputed();
            // 将更新函数存储到 @Hetui::observer 中
            self.data['@Hetui::observer']._computedUpdaters.push(updateComputed);
        },
        
        _addWatch: function(key, watchFn) {
            var self = this;
            var oldValue = self.data[key];
            
            function watchUpdate() {
                var newValue = self.data[key];
                if (oldValue !== newValue) {
                    watchFn.call(self.data, newValue, oldValue);
                    oldValue = newValue;
                }
            }
            
            // 将更新函数存储到 @Hetui::observer 中
            self.data['@Hetui::observer']._computedUpdaters.push(watchUpdate);
        },
        
        initView: function() {
            var self = this;
            
            // 确定查找范围
            var root = this._container || document;
            var elements = root.querySelectorAll('[HeTui]');
            
            for (var j =0; j < elements.length; j++) {
                
                var element = elements[j];

                if (element.hasAttribute("::break"))  continue; 
                   
                // 获取所有指令属性
                var attributes = element.attributes;
                
                for (var i = 0; i < attributes.length; i++) {
                    var attr = attributes[i];
                    var name = attr.name;
                    var value = attr.value;
                    
                    // 检查是否是指令（:开头、@开头、或以:结尾如foreach:、if:、show:）
                    var isDirective = name.charAt(0) === ':' || name.charAt(0) === '@' || name.charAt(name.length - 1) === ':';
                    if (isDirective) {
                        var directive = Directive.parse(name, value);
                        Directive.bind(element, directive, self.data, self.data['@Hetui::observer'].methods);
                    }
                }
            };
        },
        
        // 添加方法
        addMethods: function(newMethods) {
            var self = this;
            var observer = self.data['@Hetui::observer'];
            Object.keys(newMethods).forEach(function(key) {
                observer.methods[key] = newMethods[key];
            });
            return this;
        },
        
        computed: function(newComputed) {
            var self = this;
            Object.keys(newComputed).forEach(function(key) {
                self._addComputed(key, newComputed[key]);
            });
            return this;
        },
        
        watch: function(newWatch) {
            var self = this;
            Object.keys(newWatch).forEach(function(key) {
                self._addWatch(key, newWatch[key]);
            });
            return this;
        },
        
        // 获取数据
        getData: function() {
            return this.data;
        },
        
        // 设置数据
        setData: function(key, value) {
            if (this.data[key] && this.data[key]['@Hetui::observer']) {
                // 设置响应式对象的 value 属性
                this.data[key].value = value;
            } else {
                this.data[key] = value;
            }
        }
    };
    
    // 指令系统
    var Directive = {
        /**
         * 解析指令
         * @param {string} name 指令名称
         * @param {string} value 指令值
         * @returns {Object} 指令对象
         */
        parse: function(name, value) {
            var directive = {
                name: name,
                value: value,
                path: [],
                args: [],
                modifiers: [],  // 事件修饰符
                param: null      // 指令参数（如 :attr|href 中的 href）
            };
            
            // 解析事件修饰符（如 @click.prevent.stop）
            if (name.charAt(0) === '@') {
                var dotIndex = name.indexOf('.');
                if (dotIndex !== -1) {
                    // 提取修饰符部分
                    var modifierStr = name.substring(dotIndex + 1);
                    directive.modifiers = modifierStr.split('.');
                    // 更新指令名称（移除修饰符部分）
                    directive.name = name.substring(0, dotIndex);
                }
            }
            
            // 解析指令参数（如 :attr|href 中的 href）
            var pipeIndex = name.indexOf('|');
            if (pipeIndex !== -1) {
                directive.param = name.substring(pipeIndex + 1);
                directive.name = name.substring(0, pipeIndex);
            }
            
            // 解析路径（支持冒号分隔的嵌套路径）
            if (value) {
                // 支持冒号分隔的路径：user:stateClass -> ['user', 'stateClass']
                if (value.indexOf(':') !== -1) {
                    directive.path = value.split(':');
                } else {
                    directive.path = [value];
                }
            }
            
            return directive;
        },
        
        /**
         * 绑定指令到元素
         * @param {HTMLElement} element 元素
         * @param {Object} directive 指令对象
         * @param {Object} data 数据对象
         */
        bind: function(element, directive, data, methods) {
            switch (directive.name) {
                case ':text':
                    this.bindText(element, directive, data);
                    break;
                case ':value':
                    this.bindValue(element, directive, data);
                    break;
                case ':attr':
                    this.bindAttr(element, directive, data);
                    break;
                case ':data':
                    this.bindData(element, directive, data);
                    break;
                case ':class':
                    this.bindClass(element, directive, data);
                    break;
                case ':style':
                    this.bindStyle(element, directive, data);
                    break;
                case ':disabled':
                    this.bindDisabled(element, directive, data);
                    break;
                case ':checked':
                    this.bindChecked(element, directive, data);
                    break;
                case ':placeholder':
                    this.bindPlaceholder(element, directive, data);
                    break;
                case ':title':
                    this.bindTitle(element, directive, data);
                    break;
                case ':html':
                    this.bindHtml(element, directive, data);
                    break;
                case '@click':
                    this.bindEvent(element, 'click', directive, data, methods);
                    break;
                case '@submit':
                    this.bindEvent(element, 'submit', directive, data, methods);
                    break;
                case 'foreach:':
                    this.bindForeach(element, directive, data, methods);
                    break;
                case 'if:':
                    this.bindIf(element, directive, data);
                    break;
                case 'show:':
                    this.bindShow(element, directive, data);
                    break;
                default:
                    // 处理其他 @xxx 事件指令
                    if (directive.name.charAt(0) === '@') {
                        var eventType = directive.name.substring(1); // 移除 @ 前缀
                        this.bindEvent(element, eventType, directive, data, methods);
                    } else {
                        console.warn('未知指令:', directive.name);
                    }
                    break;
            }
        },
        
        /**
         * 绑定文本指令
         */
        bindText: function(element, directive, data) {
        
            var self = this;
            var updateFn = function() {
                var value = self.evaluateExpression(directive.value, data);
                element.textContent = value !== undefined ? value : '';
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定值指令
         */
        bindValue: function(element, directive, data) {
            var self = this;
            var updateFn = function() {
                var value = self.getValueByPath(data, directive.path);
                element.value = value !== undefined ? value : '';
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 监听输入事件（双向绑定）
            element.addEventListener('input', function() {
                self.setValueByPath(data, directive.path, element.value);
            });
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定属性指令
         */
        bindAttr: function(element, directive, data) {
            var self = this;
            // 只支持新格式 :attr|属性名="值"
            var attrName = directive.param || 'href';
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                if (value !== undefined) {
                    element.setAttribute(attrName, value);
                } else {
                    element.removeAttribute(attrName);
                }
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定 data-* 属性指令
         * 语法: :data="field:subfield"
         * 生成: data-field-subfield="对应的值"
         */
        bindData: function(element, directive, data) {
            var self = this;
            
            // 解析属性名和字段路径
            // :data="user:id" -> dataAttrName = "user-id", fieldPath = ["user", "id"]
            // :data="user:profile:name" -> dataAttrName = "user-profile-name", fieldPath = ["user", "profile", "name"]
            var dataAttrName = '';
            var fieldPath = [];
            
            if (directive.path.length > 0) {
                // 所有部分连接作为属性名
                // :data="user:id" -> data-user-id
                // :data="user:profile:name" -> data-user-profile-name
                dataAttrName = directive.path.join('-');
                
                // 字段路径使用所有部分
                fieldPath = directive.path;
            }
            
            // 将属性名转换为 data-* 格式（冒号转连字符）
            // user:id -> data-user-id
            var dataAttributeName = 'data-' + dataAttrName.replace(/:/g, '-');
            
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                console.log('bindData updateFn:', dataAttributeName, value, typeof value);
                if (value !== undefined && value !== null) {
                    element.setAttribute(dataAttributeName, value);
                } else {
                    element.removeAttribute(dataAttributeName);
                }
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定类指令
         */
        bindClass: function(element, directive, data) {
            var self = this;
            var className = directive.param; // 可能为 null
            var fieldPath = directive.path;
            var lastClassName = null; // 存储上一次的类名
            
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                
                if (className) {
                    // 模式1：布尔值控制 :class|类名="条件"
                    if (value) {
                        element.classList.add(className);
                    } else {
                        element.classList.remove(className);
                    }
                } else {
                    // 模式2：类名字符串 :class="类名"
                    var newClassName = value !== undefined && value !== null ? String(value) : '';
                    
                    // 删除旧的类名
                    if (lastClassName && element.classList.contains(lastClassName)) {
                        element.classList.remove(lastClassName);
                    }
                    
                    // 添加新的类名
                    if (newClassName) {
                        element.classList.add(newClassName);
                    }
                    
                    lastClassName = newClassName;
                }
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定样式指令
         */
        bindStyle: function(element, directive, data) {
            var self = this;
            // 只支持新格式 :style|样式名="值"
            var styleName = directive.param || 'color';
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                if (value !== undefined && value !== null) {
                    element.style[styleName] = value;
                } else {
                    element.style[styleName] = '';
                }
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定禁用指令
         */
        bindDisabled: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                element.disabled = !!value;
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定选中指令
         */
        bindChecked: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                element.checked = !!value;
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 监听变化事件（双向绑定）
            element.addEventListener('change', function() {
                self.setValueByPath(data, fieldPath, element.checked);
            });
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定占位符指令
         */
        bindPlaceholder: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                element.placeholder = value !== undefined ? value : '';
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定 title 指令
         */
        bindTitle: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                element.title = value !== undefined ? value : '';
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定 HTML 指令（带安全防护）
         */
        bindHtml: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                if (value !== undefined && value !== null) {
                    // 使用净化后的 HTML
                    element.innerHTML = self.sanitizeHtml(value);
                } else {
                    element.innerHTML = '';
                }
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * HTML 净化函数 - 防止 XSS 攻击
         * @param {string} html 原始 HTML 字符串
         * @returns {string} 净化后的 HTML 字符串
         */
        sanitizeHtml: function(html) {
            if (!html || typeof html !== 'string') {
                return '';
            }
            
            // 1. 移除 script 标签及其内容
            var result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            
            // 2. 移除 iframe 标签
            result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
            
            // 3. 移除 object 标签
            result = result.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
            
            // 4. 移除 embed 标签
            result = result.replace(/<embed\b[^>]*>/gi, '');
            
            // 5. 移除 applet 标签
            result = result.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
            
            // 6. 移除 form 标签（防止表单劫持）
            result = result.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
            
            // 7. 移除 on* 事件属性（如 onclick、onerror 等）
            result = result.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
            result = result.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
            
            // 8. 移除 javascript: 协议
            result = result.replace(/javascript\s*:/gi, '');
            
            // 9. 移除 data: 协议（可能用于执行代码）
            result = result.replace(/data\s*:/gi, '');
            
            // 10. 移除 vbscript: 协议
            result = result.replace(/vbscript\s*:/gi, '');
            
            // 11. 移除 expression()（IE CSS 表达式）
            result = result.replace(/expression\s*\(/gi, '');
            
            // 12. 移除 style 属性中的 @import
            result = result.replace(/@import/gi, '');
            
            return result;
        },
        
        /**
         * 绑定 foreach 循环指令
         */
        bindForeach: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var parentElement = element.parentNode;
            var placeholder = document.createComment('foreach: ' + directive.value);
           
            var breaks = element.querySelectorAll('[HeTui]');

            breaks.forEach(function(element) {
                element.setAttribute("::break", "");
            })

            // 保存模板 HTML（移除 foreach 指令属性）
            var templateHTML = element.outerHTML
            
            // console.log(templateHTML, parentElement, element)    
            // 替换原始元素为注释占位符
            parentElement.replaceChild(placeholder, element);
            
            // 存储生成的元素
            var generatedElements = [];
            
            var updateFn = function() {
                var items = self.getValueByPath(data, fieldPath);
                
                // 清除之前生成的元素
                generatedElements.forEach(function(el) {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
                generatedElements = [];
                
                if (!items || !Array.isArray(items)) {
                    return;
                }
                
                // 为每个数组项创建新元素
                items.forEach(function(item, index) {
                    // 克隆模板
                    var temp = document.createElement('div');
                    temp.innerHTML = templateHTML;
                    var newElement = temp.firstChild;

                    // 确保 newElement 是元素节点
                    if (!newElement || newElement.nodeType !== Node.ELEMENT_NODE) {
                        // 查找第一个元素节点
                        var elements = temp.getElementsByTagName('*');
                        if (elements.length > 0) {
                            newElement = elements[0];
                        } else {
                            console.error('模板中没有找到元素节点');
                            return;
                        }
                    }

                    if (index != 0) {
                        newElement.removeAttribute("foreach:");
                        newElement.setAttribute("::continue", "")
                    }

                    // 插入到占位符之前
                    parentElement.insertBefore(newElement, placeholder);
                    generatedElements.push(newElement);
                    
                    // 创建子数据对象：继承父数据 + 当前项属性 + 索引
                    var subData = Object.create(data);
                    subData['#index'] = index + 1;
                    subData['#item'] = item;  // 添加当前数组项支持
                    
                    // 将数组项包装为响应式对象（如果还不是的话）
                    if (item !== null && typeof item === 'object') {
                        Object.keys(item).forEach(function(key) {
                            // 将普通值包装为带 value 属性的对象，模拟响应式
                            subData[key] = item[key];
                        });
                    }
                    
                    // 查找所有子元素（排除自身）
                    var allChildren = newElement.querySelectorAll('*[HeTui]');
                    allChildren.forEach(function(child) {
                        // 跳过 foreach 元素本身
                        if (child === newElement) return;
                        child.removeAttribute("::break");
                        
                        var attrs = child.attributes;
                        for (var i = 0; i < attrs.length; i++) { 
                            var name = attrs[i].name;
                            var value = attrs[i].value;
                            if (name.charAt(0) === ':' || name.charAt(0) === '@' || name.slice(-1) === ':') {
                                var subDirective = Directive.parse(name, value);
                                Directive.bind(child, subDirective, subData);
                            }
                        }
                    });
                });
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
        },
        
        /**
         * 绑定事件指令（支持修饰符）
         */
        bindEvent: function(element, eventType, directive, data, methods) {
            var self = this;
            var modifiers = directive.modifiers || [];
            
            // 检查修饰符
            var useOnce = modifiers.indexOf('once') !== -1;
            var useSelf = modifiers.indexOf('self') !== -1;
            var usePrevent = modifiers.indexOf('prevent') !== -1;
            var useStop = modifiers.indexOf('stop') !== -1;
            var useCtrl = modifiers.indexOf('ctrl') !== -1;
            var useShift = modifiers.indexOf('shift') !== -1;
            var useAlt = modifiers.indexOf('alt') !== -1;
            var useMeta = modifiers.indexOf('meta') !== -1;
            
            // 键盘特定键修饰符映射
            var keyModifiers = {
                'enter': 'Enter',
                'tab': 'Tab',
                'delete': 'Delete',
                'esc': 'Escape',
                'space': ' ',
                'up': 'ArrowUp',
                'down': 'ArrowDown',
                'left': 'ArrowLeft',
                'right': 'ArrowRight',
                'home': 'Home',
                'end': 'End',
                'pageup': 'PageUp',
                'pagedown': 'PageDown'
            };
            
            // 检查是否有键盘特定键修饰符
            var useKey = null;
            for (var key in keyModifiers) {
                if (modifiers.indexOf(key) !== -1) {
                    useKey = keyModifiers[key];
                    break;
                }
            }
            
            var eventHandler = function(event) {
                // 检查修饰符条件
                if (useSelf && event.target !== element) {
                    return; // .self 修饰符：只有事件在元素自身上触发时才处理
                }
                
                if (useCtrl && !event.ctrlKey) {
                    return; // .ctrl 修饰符：需要按下 Ctrl 键
                }
                
                if (useShift && !event.shiftKey) {
                    return; // .shift 修饰符：需要按下 Shift 键
                }
                
                if (useAlt && !event.altKey) {
                    return; // .alt 修饰符：需要按下 Alt 键
                }
                
                if (useMeta && !event.metaKey) {
                    return; // .meta 修饰符：需要按下 Meta 键（Command/Windows）
                }
                
                // 键盘特定键修饰符
                if (useKey && event.key !== useKey) {
                    return; // 不是目标键，不处理
                }
                
                // .prevent 修饰符：阻止默认行为
                if (usePrevent) {
                    event.preventDefault();
                }
                
                // .stop 修饰符：阻止事件冒泡
                if (useStop) {
                    event.stopPropagation();
                }
                
                // 获取处理函数路径
                var handlerPath = directive.path;
                
                // 查找顺序：methods -> Hetui.methods -> data -> window
                var handler = null;
                
                // 1. 首先从实例 methods 中查找
                if (methods) {
                    handler = self.getValueByPath(methods, handlerPath);
                }
                
                // 2. 从全局 Hetui.methods 中查找
                if (typeof handler !== 'function') {
                    handler = self.getValueByPath(Hetui.methods, handlerPath);
                }
                
                // 3. 从 data 中查找
                if (typeof handler !== 'function') {
                    handler = self.getValueByPath(data, handlerPath);
                }
                
                // 4. 从 window 上查找全局方法
                if (typeof handler !== 'function') {
                    handler = self.getValueByPath(window, handlerPath);
                }
                
                if (typeof handler === 'function') {
                    // 调用处理函数，传入 event 和 data
                    handler.call(data, event, data);
                } else {
                    console.warn('事件处理函数未找到:', directive.value);
                }
                
                // 阻止默认行为（表单提交）
                if (eventType === 'submit') {
                    event.preventDefault();
                }
            };
            
            // .once 修饰符：只触发一次
            if (useOnce) {
                element.addEventListener(eventType, eventHandler, { once: true });
            } else {
                element.addEventListener(eventType, eventHandler);
            }
            
            // 存储指令到元素
            this.addElementDirective(element, directive);
        },
        
        /**
         * 绑定 if: 条件渲染指令
         */
        bindIf: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            var parentElement = element.parentNode;
            var placeholder = document.createComment('if: ' + directive.value);
            
            // 初始隐藏元素
            parentElement.replaceChild(placeholder, element);
            
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                
                if (value) {
                    // 显示元素
                    if (!placeholder.parentNode) {
                        return;
                    }
                    parentElement.replaceChild(element, placeholder);
                } else {
                    // 隐藏元素
                    if (!element.parentNode) {
                        return;
                    }
                    parentElement.replaceChild(placeholder, element);
                }
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
        },
        
        /**
         * 绑定 show: 显示/隐藏指令
         */
        bindShow: function(element, directive, data) {
            var self = this;
            var fieldPath = directive.path;
            
            var updateFn = function() {
                var value = self.getValueByPath(data, fieldPath);
                element.style.display = value ? '' : 'none';
            };
            
            // 开始收集依赖
            Observer.startDep(updateFn);
            
            // 初始更新
            updateFn();
            
            // 结束收集依赖
            Observer.endDep();
        },
        
        /**
         * 添加元素指令映射
         */
        addElementDirective: function(element, directive) {
            if (!Hetui.elements.has(element)) {
                Hetui.elements.set(element, new Set());
            }
            Hetui.elements.get(element).add(directive);
        },
        
        /**
         * 表达式解析和执行
         * 支持：字段路径、过滤器（|）、简单表达式
         */
        /**
         * 从 data 中获取值，正确处理响应式对象、computed 属性和普通值
         */
        getFieldValue: function(data, key) {
            var val = data[key];
            // 直接返回（支持自动解包）
            return val;
        },
        
        evaluateExpression: function(expression, data) {
            var self = this;
            
            // 处理冒号分隔的路径（如 errors:username）
            if (expression.indexOf(':') !== -1 && expression.indexOf('|') === -1) {
                var path = expression.split(':');
                return self.getValueByPath(data, path);
            }
            
            // 如果是简单路径（无运算符），直接获取值
            if (expression.indexOf('|') === -1 && expression.indexOf('+') === -1 && 
                expression.indexOf('-') === -1 && expression.indexOf('*') === -1 && 
                expression.indexOf('/') === -1 && expression.indexOf('!') === -1 && 
                expression.indexOf('>') === -1 && expression.indexOf('<') === -1 && 
                expression.indexOf('=') === -1) {
                return self.getFieldValue(data, expression);
            }
            
            // 支持过滤器语法：field | filter1 | filter2:"arg"
            if (expression.indexOf('|') !== -1) {
                var parts = expression.split('|');
                var fieldKey = parts[0].trim();
                var value = self.getFieldValue(data, fieldKey);
                
                // 从第二个部分开始，依次应用过滤器
                for (var i = 1; i < parts.length; i++) {
                    var filterPart = parts[i].trim();
                    var filterName, filterArgs = [];
                    
                    // 解析过滤器名称和参数（如 currency:"USD"）
                    if (filterPart.indexOf(':') !== -1) {
                        var colonParts = filterPart.split(':');
                        filterName = colonParts[0].trim();
                        // 解析参数（支持字符串和数字）
                        filterArgs = colonParts.slice(1).map(function(arg) {
                            arg = arg.trim();
                            // 移除引号
                            if ((arg.charAt(0) === '"' && arg.charAt(arg.length - 1) === '"') ||
                                (arg.charAt(0) === "'" && arg.charAt(arg.length - 1) === "'")) {
                                return arg.slice(1, -1);
                            }
                            // 尝试转换为数字
                            var num = Number(arg);
                            return isNaN(num) ? arg : num;
                        });
                    } else {
                        filterName = filterPart;
                    }
                    
                    // 查找过滤器函数
                    var filter = Hetui.filters[filterName] || 
                                  Hetui.methods[filterName] || 
                                  window[filterName];
                    
                    if (typeof filter === 'function') {
                        // 调用过滤器，传入值和参数
                        value = filter.apply(data, [value].concat(filterArgs));
                    } else {
                        console.warn('过滤器未找到:', filterName);
                    }
                }
                
                return value;
            }
            
            // 简单表达式求值
            try {
                var keys = Object.keys(data);
                var values = keys.map(function(key) {
                    return self.getFieldValue(data, key);
                });
                var fn = new Function(keys.join(','), 'return ' + expression);
                return fn.apply(null, values);
            } catch (e) {
                console.warn('表达式执行错误:', expression, e);
                return undefined;
            }
        },
        
        /**
         * 根据路径获取值
         */
        getValueByPath: function(obj, path) {
            var current = obj;
            for (var i = 0; i < path.length; i++) {
                if (current === null || current === undefined) {
                    return undefined;
                }
                // 访问属性（会自动触发依赖收集）
                current = current[path[i]];
            }
            return current;
        },
        
        /**
         * 根据路径设置值
         */
        setValueByPath: function(obj, path, value) {
            var current = obj;
            for (var i = 0; i < path.length - 1; i++) {
                if (current === null || current === undefined) {
                    return false;
                }
                // 访问属性（支持自动解包）
                current = current[path[i]];
            }
            
            var target = current;
            var key = path[path.length - 1];
            
            if (target === null || target === undefined) {
                return false;
            }
            
            // 直接赋值（支持自动解包）
            target[key] = value;
            return true;
        }
    };
    
    // 主初始化函数 - 支持多实例
    Hetui.Observe = function(options, container) {
        // 创建新的 App 实例，container 作为第二个参数
        var app = new App(options, container);
        
        // 返回数据对象，支持链式调用
        var returnObj = app.data;
        
        // 链式方法存储在 @Hetui::observer 中，同时保持链式调用
        var observer = returnObj['@Hetui::observer'];
        
        // 创建链式方法函数
        observer.methods = function(newMethods) {
            app.addMethods(newMethods);
            return returnObj;
        };
        
        observer.computed = function(newComputed) {
            app.computed(newComputed);
            return returnObj;
        };
        
        observer.watch = function(newWatch) {
            app.watch(newWatch);
            return returnObj;
        };
        
        // 在 returnObj 上创建代理函数，保持链式调用
        returnObj.methods = observer.methods;
        returnObj.computed = observer.computed;
        returnObj.watch = observer.watch;
        
        // 应用实例引用已经存储在 @Hetui::observer._app 中
        
        return returnObj;
    };
    
    // 创建独立应用实例的工厂函数 - 支持链式调用
    Hetui.runApp = function(options, container) {
        // 创建新的 App 实例，container 作为第二个参数
        var app = new App(options, container);
        
        // 返回数据对象，支持链式调用
        var returnObj = app.data;
        
        // 链式方法存储在 @Hetui::observer 中
        var observer = returnObj['@Hetui::observer'];
        
        // 创建链式方法函数
        observer.methods = function(newMethods) {
            app.addMethods(newMethods);
            return returnObj;
        };
        
        observer.computed = function(newComputed) {
            app.computed(newComputed);
            return returnObj;
        };
        
        observer.watch = function(newWatch) {
            app.watch(newWatch);
            return returnObj;
        };
        
        // 在 returnObj 上创建代理函数，保持链式调用
        returnObj.methods = observer.methods;
        returnObj.computed = observer.computed;
        returnObj.watch = observer.watch;
        
        // 应用实例引用已经存储在 @Hetui::observer._app 中
        
        return returnObj;
    };
    
    /**
     * 初始化视图
     */
    Hetui.initView = function(data) {
        var self = this;
        
        // 查找所有带 HeTui 属性的元素
        var elements = document.querySelectorAll('[HeTui]');
        
        elements.forEach(function(element) {
            // 获取所有指令属性
            var attributes = element.attributes;
            
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                var name = attr.name;
                var value = attr.value;
                
                // 检查是否是指令（:开头、@开头、或以:结尾如foreach:、if:、show:）
                var isDirective = name.charAt(0) === ':' || name.charAt(0) === '@' || name.charAt(name.length - 1) === ':';
                if (isDirective) {
                    var directive = Directive.parse(name, value);
                    Directive.bind(element, directive, data);
                }
            }
        });
    };
    
    /**
     * 注册方法
     */
    
    // 内置过滤器
    Hetui.filters = {
        // 大写过滤器
        uppercase: function(value) {
            if (typeof value === 'string') {
                return value.toUpperCase();
            }
            return value;
        },
        
        // 小写过滤器
        lowercase: function(value) {
            if (typeof value === 'string') {
                return value.toLowerCase();
            }
            return value;
        },
        
        // 首字母大写过滤器
        capitalize: function(value) {
            if (typeof value === 'string') {
                return value.charAt(0).toUpperCase() + value.slice(1);
            }
            return value;
        },
        
        // 截断过滤器
        truncate: function(value, length, suffix) {
            if (typeof value === 'string') {
                length = length || 10;
                suffix = suffix || '...';
                if (value.length > length) {
                    return value.substring(0, length) + suffix;
                }
            }
            return value;
        },
        
        // 货币格式化过滤器
        currency: function(value, symbol, decimals) {
            if (typeof value === 'number' || !isNaN(Number(value))) {
                symbol = symbol || '¥';
                decimals = decimals || 2;
                return symbol + Number(value).toFixed(decimals);
            }
            return value;
        },
        
        // 日期格式化过滤器（简单版）
        date: function(value, format) {
            if (value instanceof Date) {
                var year = value.getFullYear();
                var month = String(value.getMonth() + 1).padStart(2, '0');
                var day = String(value.getDate()).padStart(2, '0');
                var hours = String(value.getHours()).padStart(2, '0');
                var minutes = String(value.getMinutes()).padStart(2, '0');
                var seconds = String(value.getSeconds()).padStart(2, '0');
                
                format = format || 'YYYY-MM-DD HH:mm:ss';
                return format
                    .replace('YYYY', year)
                    .replace('MM', month)
                    .replace('DD', day)
                    .replace('HH', hours)
                    .replace('mm', minutes)
                    .replace('ss', seconds);
            }
            return value;
        },
        
        // 数字格式化过滤器（千分位）
        numberFormat: function(value, decimals, decPoint, thousandsSep) {
            if (typeof value === 'number' || !isNaN(Number(value))) {
                decimals = decimals !== undefined ? decimals : 2;
                decPoint = decPoint || '.';
                thousandsSep = thousandsSep || ',';
                
                var num = Number(value);
                var fixed = num.toFixed(decimals);
                var parts = fixed.split('.');
                
                // 添加千分位
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
                
                return parts.join(decPoint);
            }
            return value;
        },
        
        // JSON 格式化过滤器
        json: function(value, indent) {
            try {
                indent = indent || 2;
                return JSON.stringify(value, null, indent);
            } catch (e) {
                return value;
            }
        },
        
        // 默认值过滤器
        default: function(value, defaultValue) {
            if (value === undefined || value === null || value === '') {
                return defaultValue !== undefined ? defaultValue : '';
            }
            return value;
        },
        
        // 数组长度过滤器
        length: function(value) {
            if (Array.isArray(value)) {
                return value.length;
            }
            if (typeof value === 'string') {
                return value.length;
            }
            return 0;
        },
        
        // 反转字符串过滤器
        reverse: function(value) {
            if (typeof value === 'string') {
                return value.split('').reverse().join('');
            }
            if (Array.isArray(value)) {
                return value.slice().reverse();
            }
            return value;
        },
        
        // 去除首尾空格过滤器
        trim: function(value) {
            if (typeof value === 'string') {
                return value.trim();
            }
            return value;
        },
        
        // URL 编码过滤器
        encodeURIComponent: function(value) {
            if (typeof value === 'string') {
                return encodeURIComponent(value);
            }
            return value;
        },
        
        // URL 解码过滤器
        decodeURIComponent: function(value) {
            if (typeof value === 'string') {
                return decodeURIComponent(value);
            }
            return value;
        }
    };
    
    /**
     * 网络请求模块
     */
    var Network = {
        /**
         * 数据编码辅助函数
         * 将对象编码为查询字符串
         * @param {Object} data 要编码的数据
         * @param {string} prefix URL前缀（可选）
         * @returns {string} 编码后的字符串
         */
        Encoded: function(data, prefix) {
            if (!data || typeof data !== 'object') {
                return prefix || '';
            }
            
            var parts = [];
            Object.keys(data).forEach(function(key) {
                var value = data[key];
                if (value !== undefined && value !== null) {
                    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            });
            
            var queryString = parts.join('&');
            
            if (prefix) {
                return prefix + (queryString ? '?' + queryString : '');
            }
            
            return queryString;
        },
        
        /**
         * XMLHttpRequest 请求
         * @param {Object} options 配置选项
         * @param {string} options.url 请求地址
         * @param {string} options.method 请求方法（GET/POST等）
         * @param {Object} options.data 请求数据
         * @param {string} options.code 编码方式：'form'（默认）或 'json'
         * @param {Object} options.header 请求头
         * @param {boolean} options.async 是否异步（默认true）
         * @param {Object} options.option 高级选项
         */
        XHR: function(options) {
            var url = options.url;
            var method = (options.method || 'GET').toUpperCase();
            var data = options.data || {};
            var code = options.code || 'form';
            var header = options.header || {};
            var async = options.async !== false;
            var option = options.option || {};
            
            var xhr = new XMLHttpRequest();
            
            // 处理 GET 请求
            if (method === 'GET') {
                var queryString = Network.Encoded(data);
                if (queryString) {
                    url += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
                }
                xhr.open(method, url, async);
            } else {
                xhr.open(method, url, async);
            }
            
            // 设置请求头
            Object.keys(header).forEach(function(key) {
                xhr.setRequestHeader(key, header[key]);
            });
            
            // 设置响应类型
            if (option.responseType) {
                xhr.responseType = option.responseType;
            }
            
            // 处理完成回调
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var response = xhr.response;
                    
                    // 尝试解析 JSON
                    if (option.responseType === 'json' || (!option.responseType && typeof response === 'string')) {
                        try {
                            response = JSON.parse(response);
                        } catch (e) {
                            // 解析失败，使用原始值
                        }
                    }
                    
                    if (typeof option.success === 'function') {
                        option.success(response);
                    }
                } else {
                    if (typeof option.error === 'function') {
                        option.error(xhr);
                    }
                }
            };
            
            // 处理错误
            xhr.onerror = function() {
                if (typeof option.error === 'function') {
                    option.error(xhr);
                }
            };
            
            // 发送请求
            if (method === 'GET') {
                xhr.send();
            } else {
                var body = null;
                
                if (code === 'json') {
                    // JSON 编码
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    body = JSON.stringify(data);
                } else {
                    // 表单编码
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    body = Network.Encoded(data);
                }
                
                xhr.send(body);
            }
            
            return xhr;
        },
        
        /**
         * 表单提交
         * @param {Object} options 配置选项
         * @param {string} options.url 提交地址
         * @param {string} options.method 请求方法（GET/POST）
         * @param {string} options.target 目标窗口（_self/_blank）
         * @param {Object} options.data 表单数据
         */
        Form: function(options) {
            var url = options.url;
            var method = (options.method || 'POST').toUpperCase();
            var target = options.target || '_self';
            var data = options.data || {};
            
            // 创建隐藏表单
            var form = document.createElement('form');
            form.method = method;
            form.action = url;
            form.target = target;
            form.style.display = 'none';
            
            // 添加表单字段
            Object.keys(data).forEach(function(key) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = data[key];
                form.appendChild(input);
            });
            
            // 添加到文档并提交
            document.body.appendChild(form);
            form.submit();
            
            // 移除表单
            document.body.removeChild(form);
        },
        
        /**
         * JSONP 请求
         * @param {Object} options 配置选项
         * @param {string} options.url 请求地址
         * @param {Object} options.data 请求数据
         * @param {Object} option 配置选项
         * @param {string} option.name 全局回调函数名
         * @param {string} option.value URL中的回调参数名
         * @param {Function} option.functor 回调处理函数
         */
        JsonP: function(options, option) {
            var url = options.url;
            var data = options.data || {};
            var callbackName = option.name || 'jsonp_' + Date.now();
            var callbackParam = option.value || 'callback';
            var functor = option.functor;
            
            // 添加回调函数到 data
            data[callbackParam] = callbackName;
            
            // 创建全局回调函数
            window[callbackName] = function(response) {
                if (typeof functor === 'function') {
                    functor(response);
                }
                
                // 清理
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            // 构建 URL
            var queryString = Network.Encoded(data);
            var fullUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + queryString;
            
            // 创建 script 标签
            var script = document.createElement('script');
            script.src = fullUrl;
            script.onerror = function() {
                if (typeof functor === 'function') {
                    functor({ error: 'JSONP request failed' });
                }
                
                // 清理
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            document.head.appendChild(script);
        },
        
        /**
         * Fetch API 请求
         * @param {Object} options 配置选项
         * @param {string} options.url 请求地址
         * @param {string} options.method 请求方法（GET/POST等）
         * @param {Object} options.data 请求数据
         * @param {string} options.code 编码方式：'json'（默认）、'form'、'text'
         * @param {Object} options.header 请求头
         * @param {Object} options.option 高级选项
         */
        Fetch: function(options) {
            var url = options.url;
            var method = (options.method || 'GET').toUpperCase();
            var data = options.data || {};
            var code = options.code || 'json';
            var header = options.header || {};
            var option = options.option || {};
            
            var fetchOptions = {
                method: method,
                headers: header
            };
            
            // 处理请求体
            if (method !== 'GET') {
                if (code === 'json') {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                    fetchOptions.body = JSON.stringify(data);
                } else if (code === 'form') {
                    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    fetchOptions.body = Network.Encoded(data);
                } else {
                    fetchOptions.body = data;
                }
            } else {
                // GET 请求，将数据添加到 URL
                var queryString = Network.Encoded(data);
                if (queryString) {
                    url += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
                }
            }
            
            fetch(url, fetchOptions)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    
                    // 根据 responseType 处理响应
                    var responseType = option.responseType || 'json';
                    
                    if (responseType === 'json') {
                        return response.json();
                    } else if (responseType === 'text') {
                        return response.text();
                    } else if (responseType === 'blob') {
                        return response.blob();
                    } else if (responseType === 'arrayBuffer') {
                        return response.arrayBuffer();
                    } else {
                        return response.json();
                    }
                })
                .then(function(data) {
                    if (typeof option.success === 'function') {
                        option.success(data);
                    }
                })
                .catch(function(error) {
                    if (typeof option.error === 'function') {
                        option.error(error);
                    }
                })
                .finally(function() {
                    if (typeof option.complete === 'function') {
                        option.complete();
                    }
                });
        }
    };
    
    // 暴露全局对象
    window.Hetui = Hetui;
    window.Observer = Observer;
    window.Network = Network;
    
    // 自动初始化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Hetui Mini 框架已加载');
    });
    
})();