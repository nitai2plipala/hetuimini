async page => {
    const results = {};

    async function spans() {
        return await page.evaluate(() => {
            const spans = document.querySelectorAll('#app span[HeTui]');
            const arr = [];
            spans.forEach(s => arr.push(s.textContent.trim()));
            return arr;
        });
    }

    // 初始值
    const initial = await spans();
    results['初始'] = {
        a: initial[0], b: initial[1], flag: initial[2], status: initial[3],
        'a+b': initial[4], 'a+10': initial[5],
        'a-b': initial[6], 'b-1': initial[7],
        'a*b': initial[8], 'a*2': initial[9],
        'a/b': initial[10], 'b/2': initial[11],
        '!flag': initial[12], '!a': initial[13], '!(a<b)': initial[14], 'a==5': initial[15],
        '(a+b)*2-a': initial[16], '(a*b)/(a-b)': initial[17], '((a+b)*(a-b))': initial[18], 'a*(b+1)-(a/b)': initial[19]
    };

    // 点 a++ 后 a=11，重新计算
    await page.getByRole('button', { name: 'a++' }).click();
    await page.waitForTimeout(100);
    const afterInc = await spans();
    results['a++后'] = {
        a: afterInc[0],
        'a+b': afterInc[4],     // 11+5=16
        'a*b': afterInc[8],     // 11*5=55
        '(a+b)*2-a': afterInc[16] // (11+5)*2-11=21
    };

    // 点"切换 flag" 后 flag=false
    await page.getByRole('button', { name: '切换 flag' }).click();
    await page.waitForTimeout(100);
    const afterFlag = await spans();
    results['切换flag后'] = {
        flag: afterFlag[2],
        '!flag': afterFlag[12]  // !false=true
    };

    // 点"切换 status"
    await page.getByRole('button', { name: '切换 status' }).click();
    await page.waitForTimeout(100);
    const afterStatus = await spans();
    results['切换status后'] = { status: afterStatus[3] };

    // 重置
    await page.getByRole('button', { name: '重置' }).click();
    await page.waitForTimeout(100);
    const afterReset = await spans();
    results['重置后'] = { a: afterReset[0], b: afterReset[1], flag: afterReset[2], status: afterReset[3] };

    return JSON.stringify(results, null, 2);
}
