from argon2 import PasswordHasher, hash_password, Type
# ph = PasswordHasher(time_cost=5, memory_cost=7000, parallelism=1, hash_len=32
# hash = ph.hash("amazon", time_cost=5, memory_cost=7000, parallelism=1, hash_len=32,)
a_hash = hash_password(
	password=b"amazon", salt=b"12345789", time_cost=5, memory_cost=1024, parallelism=1, hash_len=32, type=Type.ID)
print(a_hash)
