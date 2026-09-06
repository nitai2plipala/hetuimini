async page => {
    const results = {};

    async function liCount() {
        return await page.$$eval('#app ul li', els => els.length);
    }
    async function emptyVisible() {
        return await page.$eval('.empty', el => el.style.display !== 'none' && !!el.parentNode).catch(() => false);
    }
    async function status() {
        return await page.$eval('#status', el => el.textContent.trim());
    }

    // 初始：空数组，应显示"暂无数据"
    results['初始'] = { liCount: await liCount(), emptyVisible: await emptyVisible() };

    // 点"整体赋值" (setTimeout 600ms)
    await page.getByRole('button', { name: '整体赋值 data.repos = newArr' }).click();
    await page.waitForTimeout(800);
    results['整体赋值后'] = { liCount: await liCount(), status: await status(), emptyVisible: await emptyVisible() };
    // 验证第一项内容
    results['整体赋值第一项'] = await page.$eval('#app ul li:first-child', el => el.textContent.trim());

    // 点"清空"
    await page.getByRole('button', { name: '清空', exact: true }).click();
    await page.waitForTimeout(200);
    results['清空后'] = { liCount: await liCount(), emptyVisible: await emptyVisible(), status: await status() };

    // 点"splice+push" (setTimeout 600ms)
    await page.getByRole('button', { name: 'splice 清空 + push 逐项' }).click();
    await page.waitForTimeout(800);
    results['splicePush后'] = { liCount: await liCount(), status: await status() };
    results['splicePush第一项'] = await page.$eval('#app ul li:first-child', el => el.textContent.trim());

    // 点"追加一项"
    await page.getByRole('button', { name: '追加一项' }).click();
    await page.waitForTimeout(200);
    results['追加后'] = { liCount: await liCount(), status: await status() };

    // 点"XHR 整体赋值" (后端请求)
    await page.getByRole('button', { name: 'XHR 整体赋值' }).click();
    await page.waitForTimeout(1000);
    results['XHR后'] = { liCount: await liCount(), status: await status() };
    results['XHR第一项'] = await page.$eval('#app ul li:first-child', el => el.textContent.trim()).catch(() => 'no li');

    // 点"清空" 再测 Fetch
    await page.getByRole('button', { name: '清空', exact: true }).click();
    await page.waitForTimeout(200);

    // 点"Fetch + splice/push"
    await page.getByRole('button', { name: 'Fetch + splice/push' }).click();
    await page.waitForTimeout(1000);
    results['Fetch后'] = { liCount: await liCount(), status: await status() };
    results['Fetch第一项'] = await page.$eval('#app ul li:first-child', el => el.textContent.trim()).catch(() => 'no li');

    return JSON.stringify(results, null, 2);
}
