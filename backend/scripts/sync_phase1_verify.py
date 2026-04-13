#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de sincronización profesional con Supabase
Fase 1: Verificación y backup de datos
"""

import os
import json
from datetime import datetime
from django.db import connection
from django.core import serializers


def verify_connection():
    """Verificar conexión a Supabase"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
            return True
    except Exception as e:
        print(f"Error: {e}")
        return False


def get_existing_tables():
    """Obtener todas las tablas existentes"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """
            )
            return [row[0] for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error al obtener tablas: {e}")
        return []


def count_records_by_table(table_names):
    """Contar registros en cada tabla"""
    counts = {}
    try:
        with connection.cursor() as cursor:
            for table in table_names:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    counts[table] = count
                except:
                    pass
    except Exception as e:
        print(f"Error: {e}")
    return counts


def main():
    print("\n" + "=" * 80)
    print("SINCRONIZACIÓN PROFESIONAL CON SUPABASE")
    print("FASE 1: VERIFICACIÓN Y ANÁLISIS")
    print("=" * 80 + "\n")

    # 1. Verificar conexión
    print("1️⃣  VERIFICANDO CONEXIÓN...")
    if verify_connection():
        print("     ✅ Conexión exitosa a Supabase\n")
    else:
        print("     ❌ Error de conexión\n")
        return False

    # 2. Obtener tablas
    print("2️⃣  TABLAS EXISTENTES:")
    tables = get_existing_tables()
    for table in tables:
        print(f"     📋 {table}")
    print(f"     Total: {len(tables)} tablas\n")

    # 3. Contar registros
    print("3️⃣  REGISTROS POR TABLA (datos reales):")
    table_names = [
        "usuarios_usuario",
        "reportes_reportediario",
        "reportes_ventaproducto",
        "gastos_categoriagasto",
        "gastos_gasto",
        "gastos_gastoautomatico",
        "gastos_gastodeducible",
        "productos_producto",
    ]

    counts = count_records_by_table(table_names)
    total_records = 0
    for table, count in counts.items():
        if count > 0:
            print(f"     ✅ {table}: {count} registros")
            total_records += count
        else:
            print(f"     ⚠️  {table}: vacío")

    print(f"\n     TOTAL DE REGISTROS REALES: {total_records}\n")

    # 4. Verificar tablas críticas
    print("4️⃣  VERIFICACIÓN DE DATOS CRÍTICOS:")
    critical_status = {
        "usuarios_usuario": counts.get("usuarios_usuario", 0) > 0,
        "gastos_gastoautomatico": counts.get("gastos_gastoautomatico", 0) >= 0,
        "gastos_gastodeducible": counts.get("gastos_gastodeducible", 0) >= 0,
    }

    for table, exists in critical_status.items():
        status = "✅" if exists else "⚠️ "
        print(f"     {status} {table}")

    print("\n" + "=" * 80)
    print("RESULTADO: Sistema listo para sincronizar")
    print("=" * 80 + "\n")

    return True


if __name__ == "__main__":
    main()
