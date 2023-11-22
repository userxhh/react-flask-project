import sqlite3
import random
import string
from datetime import datetime

# 数据库文件
dbname="websy"

connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
cursor = connection.cursor()

# 是否插入新用户
insert_new_users = input("是否插入新用户 (yes/no): ").strip().lower() == "yes"

# 插入用户数量
if insert_new_users:
    num_users = int(input("要插入的用户数量: "))
else:
    num_users = 0

# 插入博客数量
num_blogs = int(input("要插入的博客数量: "))

# 获取现有用户数量
cursor.execute("select count(*) from users")
num_users_in_db = cursor.fetchone()[0]

# 插入用户
if insert_new_users:
    for _ in range(num_users):
        user_name = ''.join(random.choice(string.ascii_letters) for _ in range(8))
        user_password = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
        cursor.execute("INSERT INTO users (name, password) VALUES (?, ?)", (user_name, user_password))
    connection.commit()
    print(f"{num_users} 个用户已插入。")

# 插入博客
for _ in range(num_blogs):
    user_id = random.randint(1, num_users) if insert_new_users else random.randint(1, num_users_in_db)
    blog_title = "Sample Blog Title"
    blog_context = "This is the content of the blog."
    publish_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    comment_count = random.randint(0, 10)
    cursor.execute(
        "INSERT INTO posts (user_id, title, context, publish_time, comment_count) VALUES (?, ?, ?, ?, ?)",
        (user_id, blog_title, blog_context, publish_time, comment_count)
    )
connection.commit()
print(f"{num_blogs} 个博客已插入。")

# 关闭数据库连接
connection.close()
