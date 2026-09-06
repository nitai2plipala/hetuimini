async page => {
    const results = {};

    async function spanText(selector) {
        return await page.$eval(selector, el => el.textContent.trim()).catch(() => 'NOT_FOUND');
    }

    // 测试1: 文本绑定 + 计数器
    await page.getByRole('button', { name: '+1', exact: true }).click();
    await page.getByRole('button', { name: '+1', exact: true }).click();
    await page.waitForTimeout(80);
    results['测试1_文本+计数'] = {
        greeting: await spanText('.section:nth-of-type(1) p:nth-child(1) span'),
        count: await spanText('.section:nth-of-type(1) p:nth-child(2) span')
    };

    // 测试2: 双向绑定
    await page.fill('.section:nth-of-type(2) input', '李四');
    await page.waitForTimeout(80);
    results['测试2_双向绑定'] = {
        inputVal: await page.$eval('.section:nth-of-type(2) input', el => el.value),
        spanVal: await spanText('.section:nth-of-type(2) p:nth-child(2) span')
    };

    // 测试3: 属性绑定
    results['测试3_属性'] = {
        href: await page.$eval('.section:nth-of-type(3) a', el => el.getAttribute('href')),
        inputVal: await page.$eval('.section:nth-of-type(3) input', el => el.value)
    };

    // 测试4: 类绑定 (isActive=false 初始)
    results['测试4_类初始'] = { class: await page.$eval('.section:nth-of-type(4) span', el => el.className) };
    await page.getByRole('button', { name: '切换状态' }).click();
    await page.waitForTimeout(80);
    results['测试4_类切换后'] = { class: await page.$eval('.section:nth-of-type(4) span', el => el.className) };

    // 测试5: 表单提交
    await page.fill('.section:nth-of-type(5) input[type="email"]', 'test@test.com');
    await page.fill('.section:nth-of-type(5) input[type="password"]', '123456');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForTimeout(80);
    results['测试5_表单'] = { loginStatus: await spanText('.section:nth-of-type(5) p:last-child span') };

    // 测试6: 计算属性
    results['测试6_计算属性'] = {
        count: await spanText('.section:nth-of-type(6) p:nth-child(1) span'),
        doubleCount: await spanText('.section:nth-of-type(6) p:nth-child(2) span'),
        isPositive: await spanText('.section:nth-of-type(6) p:nth-child(3) span')
    };

    // 测试7: 循环
    const liCount = await page.$$eval('.section:nth-of-type(7) li', els => els.length);
    await page.getByRole('button', { name: '添加商品' }).click();
    await page.waitForTimeout(80);
    results['测试7_循环'] = {
        初始项数: liCount,
        添加后项数: await page.$$eval('.section:nth-of-type(7) li', els => els.length)
    };

    // 测试8: 条件渲染
    await page.getByRole('button', { name: '切换显示' }).click();  // toggleShow (showDisplay)
    await page.getByRole('button', { name: '切换条件', exact: true }).click(); // toggleIf (showIf)
    await page.waitForTimeout(80);
    results['测试8_条件'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[7];
        const ifDiv = box.querySelector('div[style*="e8f5e9"]');
        const showDiv = box.querySelector('div[style*="e3f2fd"]');
        return {
            ifDiv存在: !!ifDiv,
            showDiv_display: showDiv ? showDiv.style.display : 'not found'
        };
    });

    // 测试9: 样式
    results['测试9_样式'] = {
        fontColor: await page.$eval('.section:nth-of-type(9) span[HeTui]', el => el.style.color),
        bgColor: await page.$eval('.section:nth-of-type(9) div[HeTui]', el => el.style.backgroundColor)
    };
    await page.getByRole('button', { name: '切换颜色' }).click();
    await page.waitForTimeout(80);
    results['测试9_切换颜色后'] = { fontColor: await page.$eval('.section:nth-of-type(9) span[HeTui]', el => el.style.color) };

    // 测试10: 禁用
    results['测试10_禁用初始'] = {
        disabled: await page.$eval('.section:nth-of-type(10) input', el => el.disabled),
        text: await spanText('.section:nth-of-type(10) p:last-child span')
    };
    await page.getByRole('button', { name: '切换禁用状态' }).click();
    await page.waitForTimeout(80);
    results['测试10_切换后'] = {
        disabled: await page.$eval('.section:nth-of-type(10) input', el => el.disabled),
        text: await spanText('.section:nth-of-type(10) p:last-child span')
    };

    // 测试11: 选中
    results['测试11_选中初始'] = {
        checked: await page.$eval('.section:nth-of-type(11) input', el => el.checked),
        text: await spanText('.section:nth-of-type(11) p:last-child span')
    };
    await page.getByRole('button', { name: '切换选中状态' }).click();
    await page.waitForTimeout(80);
    results['测试11_切换后'] = {
        checked: await page.$eval('.section:nth-of-type(11) input', el => el.checked),
        text: await spanText('.section:nth-of-type(11) p:last-child span')
    };

    // 测试12: 占位符
    results['测试12_占位符初始'] = { ph: await page.$eval('.section:nth-of-type(12) input', el => el.placeholder) };
    await page.getByRole('button', { name: '改变占位符' }).click();
    await page.waitForTimeout(80);
    results['测试12_切换后'] = { ph: await page.$eval('.section:nth-of-type(12) input', el => el.placeholder) };

    // 测试13: HTML
    results['测试13_HTML初始'] = { html: await page.$eval('.section:nth-of-type(13) div[HeTui]', el => el.innerHTML) };
    await page.getByRole('button', { name: '改变HTML内容' }).click();
    await page.waitForTimeout(80);
    results['测试13_切换后'] = { html: await page.$eval('.section:nth-of-type(13) div[HeTui]', el => el.innerHTML) };

    // 测试14: 事件修饰符
    await page.getByRole('button', { name: '.prevent 阻止默认行为' }).click();
    await page.waitForTimeout(50);
    results['测试14_prevent'] = { log: await spanText('.section:nth-of-type(14) p:last-child span') };
    await page.getByRole('button', { name: '.stop 阻止冒泡' }).click();
    await page.waitForTimeout(50);
    results['测试14_stop'] = { log: await spanText('.section:nth-of-type(14) p:last-child span') };
    await page.getByRole('button', { name: '.once 只触发一次' }).click();
    await page.waitForTimeout(50);
    const once1 = await spanText('.section:nth-of-type(14) p:last-child span');
    await page.getByRole('button', { name: '.once 只触发一次' }).click();
    await page.waitForTimeout(50);
    const once2 = await spanText('.section:nth-of-type(14) p:last-child span');
    results['测试14_once'] = { 第一次: once1, 第二次: once2 };

    // 测试15: 过滤器
    results['测试15_过滤器'] = {
        原始: await spanText('.section:nth-of-type(15) p:nth-child(1) span'),
        货币: await spanText('.section:nth-of-type(15) p:nth-child(2) span'),
        大写: await spanText('.section:nth-of-type(15) p:nth-child(4) span'),
        小写: await spanText('.section:nth-of-type(15) p:nth-child(5) span'),
        截断: await spanText('.section:nth-of-type(15) p:nth-child(7) span'),
        链式: await spanText('.section:nth-of-type(15) p:nth-child(9) span'),
        默认值: await spanText('.section:nth-of-type(15) p:nth-child(10) span')
    };

    // 测试16: data-* 属性
    results['测试16_data初始'] = {
        userId: await page.$eval('.section:nth-of-type(16) div[HeTui]:nth-of-type(1)', el => el.getAttribute('data-user-id')),
        userName: await page.$eval('.section:nth-of-type(16) div[HeTui]:nth-of-type(2)', el => el.getAttribute('data-user-name')),
        userEmail: await page.$eval('.section:nth-of-type(16) div[HeTui]:nth-of-type(3)', el => el.getAttribute('data-user-profile-email'))
    };
    await page.getByRole('button', { name: '改变用户数据' }).click();
    await page.waitForTimeout(80);
    results['测试16_data改变后'] = {
        userId: await page.$eval('.section:nth-of-type(16) div[HeTui]:nth-of-type(1)', el => el.getAttribute('data-user-id')),
        userName: await page.$eval('.section:nth-of-type(16) div[HeTui]:nth-of-type(2)', el => el.getAttribute('data-user-name'))
    };
    // 点"读取 data-* 属性"
    await page.getByRole('button', { name: '读取 data-* 属性' }).click();
    await page.waitForTimeout(80);
    results['测试16_读取后'] = { log: await spanText('.section:nth-of-type(16) p:last-child span') };

    // 测试17: title
    results['测试17_title初始'] = {
        title: await page.$eval('.section:nth-of-type(17) span', el => el.getAttribute('title')),
        text: await spanText('.section:nth-of-type(17) p:last-child span')
    };
    await page.getByRole('button', { name: '改变提示文本' }).click();
    await page.waitForTimeout(80);
    results['测试17_title改变后'] = {
        title: await page.$eval('.section:nth-of-type(17) span', el => el.getAttribute('title')),
        text: await spanText('.section:nth-of-type(17) p:last-child span')
    };

    return JSON.stringify(results, null, 2);
}
