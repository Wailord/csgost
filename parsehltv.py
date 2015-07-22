#!/usr/bin/env python
# -*- coding: utf-8 -*-

from lxml import html
import requests

def ParseHLTVPage(pageUrl):
    page_matches = [];
    page = requests.get(pageUrl) 
    tree = html.fromstring(page.text)

    curMatch = 0;
    for curMatch in range(50):
        match = tree.xpath('//*[@id="back"]/div[12]/div[3]/div[2]/div[4]/div/div[' + str(curMatch * 2 + 6) + ']/div'
        # team 1
        # team 2

        