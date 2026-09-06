async page => {
    const results = {};

    async function spanText(selector) {
        return await page.$eval(selector, el => el.textContent.trim()).catch(() => 'NOT_FOUND:' + selector);
    }

    // 初始值检查
    results['初始'] = {
        count: await spanText('.section:nth-of-type(1) .level .success'),
        userName: await spanText('.section:nth-of-type(2) .level > p:nth-child(1) .success'),
        userAge: await spanText('.section:nth-of-type(2) .level > p:nth-child(2) .success'),
        companyName: await spanText('.section:nth-of-type(3) .level > p:nth-child(1) .success'),
        deptName: await spanText('.section:nth-of-type(3) .level-2 p:nth-child(1) .success'),
        deptBudget: await spanText('.section:nth-of-type(3) .level-2 p:nth-child(2) .success'),
        orgName: await spanText('.section:nth-of-type(4) .level > p:nth-child(1) .success'),
        teamName3: await spanText('.section:nth-of-type(4) .level-3 p:nth-child(1) .success'),
        teamCount3: await spanText('.section:nth-of-type(4) .level-3 p:nth-child(2) .success'),
        uniName: await spanText('.section:nth-of-type(5) .level > p:nth-child(1) .success'),
        className4: await spanText('.section:nth-of-type(5) .level-4 p:nth-child(1) .success'),
        studentCount4: await spanText('.section:nth-of-type(5) .level-4 p:nth-child(2) .success'),
        projectName: await spanText('.section:nth-of-type(6) .level > p:nth-child(1) .success'),
        leaderName: await spanText('.section:nth-of-type(6) .level-2 p:nth-child(1) .success'),
        projTeamName: await spanText('.section:nth-of-type(6) .level-3 p:nth-child(1) .success')
    };

    // 点"全部+1"
    await page.getByRole('button', { name: '全部 +1' }).click();
    await page.waitForTimeout(100);
    results['全部+1后'] = {
        count: await spanText('.section:nth-of-type(1) .level .success'),
        userAge: await spanText('.section:nth-of-type(2) .level > p:nth-child(2) .success'),
        deptBudget: await spanText('.section:nth-of-type(3) .level-2 p:nth-child(2) .success'),
        teamCount3: await spanText('.section:nth-of-type(4) .level-3 p:nth-child(2) .success'),
        studentCount4: await spanText('.section:nth-of-type(5) .level-4 p:nth-child(2) .success'),
        projTeamCount: await spanText('.section:nth-of-type(6) .level-3 p:nth-child(2) .success')
    };

    // 点"自动测试"按钮，验证 passedTests=6, failedTests=0
    await page.getByRole('button', { name: '自动测试' }).click();
    await page.waitForTimeout(200);
    results['自动测试'] = {
        testStatus: await spanText('.result p:nth-child(2) .success'),
        passed: await spanText('.result p:nth-child(3) .success'),
        failed: await spanText('.result p:nth-child(4) .error')
    };

    return JSON.stringify(results, null, 2);
}
