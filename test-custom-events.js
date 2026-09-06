async page => {
    const results = {};

    async function spanText(selector) {
        return await page.$eval(selector, el => el.textContent.trim()).catch(() => 'NOT_FOUND');
    }

    // 测试1: 点 #custom-box 区域本身不会触发 user-login（需 dispatchEvent），预期 log 为空
    await page.click('#custom-box');
    await page.waitForTimeout(100);
    results['测试1_点区域(预期空)'] = { loginLog: await spanText('.section:nth-of-type(1) .log span') };

    // 测试1: 点"手动触发"按钮 → triggerLogin 内部 dispatchEvent
    await page.getByRole('button', { name: '手动触发 user-login 事件' }).click();
    await page.waitForTimeout(100);
    results['测试1_点按钮'] = { loginLog: await spanText('.section:nth-of-type(1) .log span') };

    // 测试2: 点"手动触发 data-update"按钮，验证 detail 数据传递
    await page.getByRole('button', { name: '手动触发 data-update 事件（带数据）' }).click();
    await page.waitForTimeout(100);
    const t2 = await spanText('.section:nth-of-type(2) .log span');
    let t2parsed = null;
    try { t2parsed = JSON.parse(t2); } catch (e) {}
    results['测试2_带数据'] = { receivedData: t2, parsed: t2parsed };

    // 测试3: 点 #child 触发 parent-event 冒泡到父容器
    await page.click('#child');
    await page.waitForTimeout(100);
    results['测试3_冒泡'] = { parentLog: await spanText('.section:nth-of-type(3) .log span') };

    // 测试4: 点"创建订单"按钮（triggerOrder 通过 getElementById 派发到 #order-box）
    await page.getByRole('button', { name: '创建订单' }).click();
    await page.waitForTimeout(100);
    const orderInfo = await spanText('.section:nth-of-type(4) .log span');
    const orderMatch = orderInfo.match(/订单 #(\d+): (.+)/);
    results['测试4_点按钮'] = {
        orderInfo,
        格式正确: !!orderMatch,
        items: orderMatch ? orderMatch[2] : null
    };

    // 测试4 补充: 直接在绑定的 div 上 dispatchEvent，验证框架监听正常
    await page.evaluate(() => {
        const box = document.getElementById('order-box');
        box.dispatchEvent(new CustomEvent('order-created', {
            bubbles: true,
            detail: { id: 999, items: ['X', 'Y', 'Z'], total: 100 }
        }));
    });
    await page.waitForTimeout(150);
    results['测试4_直接dispatch'] = { orderInfo: await spanText('.section:nth-of-type(4) .log span') };

    return JSON.stringify(results, null, 2);
}
