#!/usr/bin/env python3
import json
import csv
import glob
import os

def merge_json_files(json_dir="./exports/json/", output_csv="./exports/blog-articles-summary-final.csv"):
    """
    JSONファイルをマージしてCSVに出力する
    """
    
    json_files = glob.glob(os.path.join(json_dir, "*.json"))
    json_files.sort()
    
    all_articles = []
    
    # 各JSONファイルを読み込んで統合
    for json_file in json_files:
        print(f"Processing: {json_file}")
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # batch_infoを取得
            batch_info = data.get('batch_info', {})
            print(f"  Range: {batch_info.get('range', 'unknown')}")
            print(f"  Articles: {batch_info.get('total_articles', 0)}")
            
            # articlesを追加
            articles = data.get('articles', [])
            all_articles.extend(articles)
            
        except Exception as e:
            print(f"Error processing {json_file}: {e}")
            continue
    
    # article_numberでソート
    all_articles.sort(key=lambda x: x.get('article_number', 0))
    
    print(f"\nTotal articles collected: {len(all_articles)}")
    
    # CSVに出力
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    
    with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['article_number', 'title', 'date', 'category', 'basename', 'summary', 'recommendation_stars']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        
        for article in all_articles:
            # 必要なフィールドのみを抽出
            row = {
                'article_number': article.get('article_number', ''),
                'title': article.get('title', ''),
                'date': article.get('date', ''),
                'category': article.get('category', ''),
                'basename': article.get('basename', ''),
                'summary': article.get('summary', ''),
                'recommendation_stars': article.get('recommendation_stars', '')
            }
            writer.writerow(row)
    
    print(f"\nCSV output: {output_csv}")
    print(f"Successfully merged {len(json_files)} JSON files into CSV with {len(all_articles)} articles")

if __name__ == "__main__":
    merge_json_files()