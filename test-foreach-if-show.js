async page => {
    const results = {};

    // 一、简单测试
    // 1. foreach 简单数组
    results['一1_foreach简单'] = await page.$$eval('.section:nth-of-type(1) .test-box:nth-of-type(1) li', els => els.map(e => e.textContent.trim().replace(/\s+/g, ' ')));
    // 2. if 简单条件 (showWarning=true 显示, hideInfo=false 隐藏)
    const warn1 = await page.$eval('.section:nth-of-type(1) .test-box:nth-of-type(2)', el => el.innerHTML);
    results['一2_if初始'] = {
        警告显示: warn1.includes('警告信息') && !!warn1.match(/if:/) === false,
        警告div存在: !!warn1.match(/<div[^>]*class="error"/)
    };
    // 点"切换警告" → false，警告隐藏
    await page.getByRole('button', { name: '切换警告' }).click();
    await page.waitForTimeout(80);
    results['一2_切换警告后'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[0].querySelectorAll('.test-box')[1];
        const warnDiv = box.querySelector('.error');
        return { 警告div存在: !!warnDiv };
    });
    // 点"切换信息" → true，信息显示
    await page.getByRole('button', { name: '切换信息' }).click();
    await page.waitForTimeout(80);
    results['一2_切换信息后'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[0].querySelectorAll('.test-box')[1];
        const infoDiv = box.querySelector('.info');
        return { 信息div存在: !!infoDiv };
    });

    // 3. show 简单显示 (isVisible=true 显示, isHidden=false 隐藏)
    results['一3_show初始'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[0].querySelectorAll('.test-box')[2];
        const successDiv = box.querySelector('.success');
        const infoDiv = box.querySelector('.info');
        return {
            可见内容display: successDiv ? successDiv.style.display : 'not found',
            隐藏内容display: infoDiv ? infoDiv.style.display : 'not found'
        };
    });
    // 点"切换可见性" → false
    await page.getByRole('button', { name: '切换可见性' }).click();
    await page.waitForTimeout(80);
    results['一3_切换可见性后'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[0].querySelectorAll('.test-box')[2];
        const successDiv = box.querySelector('.success');
        return { 可见内容display: successDiv ? successDiv.style.display : 'not found' };
    });

    // 二、嵌套访问
    // 1. foreach 嵌套对象数组 user:contacts
    results['二1_foreach嵌套'] = await page.$$eval('.section:nth-of-type(2) .test-box:nth-of-type(1) li', els => els.map(e => e.textContent.trim().replace(/\s+/g, ' ')));
    // 2. if 嵌套条件
    results['二2_if嵌套初始'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[1].querySelectorAll('.test-box')[1];
        const infoDiv = box.querySelector('.info'); // 高级设置 showAdvanced=true
        const successDiv = box.querySelector('.success'); // 编辑权限 canEdit=true
        return { 高级设置存在: !!infoDiv, 编辑权限存在: !!successDiv };
    });
    // 点"切换高级设置" → false
    await page.getByRole('button', { name: '切换高级设置' }).click();
    await page.waitForTimeout(80);
    results['二2_切换高级后'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[1].querySelectorAll('.test-box')[1];
        const infoDiv = box.querySelector('.info');
        return { 高级设置存在: !!infoDiv };
    });

    // 三、组合测试
    // 1. foreach + if 组合
    results['三1_foreach+if'] = await page.$$eval('.section:nth-of-type(3) .test-box:nth-of-type(1) li', els => els.map(e => e.textContent.trim().replace(/\s+/g, ' ')));
    // 2. foreach + show 组合
    results['三2_foreach+show'] = await page.$$eval('.section:nth-of-type(3) .test-box:nth-of-type(2) li', els => els.map(e => e.textContent.trim().replace(/\s+/g, ' ')));

    // 四、复杂嵌套
    // 1. 三层嵌套 company:departments:engineering
    results['四1_三层嵌套'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[3].querySelectorAll('.test-box')[0];
        const activeDiv = box.querySelector('.success');
        const projectsDiv = box.querySelector('.info');
        const lis = box.querySelectorAll('ul li');
        return {
            工程部门激活存在: !!activeDiv,
            显示项目存在: !!projectsDiv,
            项目数: lis.length,
            第一项: lis[0]?.textContent?.trim()?.replace(/\s+/g, ' ')
        };
    });
    // 点"切换显示项目" → false
    await page.getByRole('button', { name: '切换显示项目' }).click();
    await page.waitForTimeout(80);
    results['四1_切换显示项目后'] = await page.evaluate(() => {
        const box = document.querySelectorAll('.section')[3].querySelectorAll('.test-box')[0];
        const projectsDiv = box.querySelector('.info');
        return { 显示项目存在: !!projectsDiv };
    });

    // 测试结果
    results['testResults'] = await page.$eval('#testResults', el => el.textContent.trim());

    return JSON.stringify(results, null, 2);
}
