import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This API route removes duplicate banks from the database
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get all banks ordered by name
    const { data: banks, error: fetchError } = await supabase
      .from('banks')
      .select('*')
      .order('name', { ascending: true });
    
    if (fetchError) {
      throw new Error(`Error fetching banks: ${fetchError.message}`);
    }
    
    // Identify duplicates
    const seenNames = new Set();
    const duplicates = [];
    
    for (const bank of banks) {
      if (seenNames.has(bank.name)) {
        duplicates.push(bank);
      } else {
        seenNames.add(bank.name);
      }
    }
    
    // Remove duplicates
    let removedCount = 0;
    for (const duplicate of duplicates) {
      const { error: deleteError } = await supabase
        .from('banks')
        .delete()
        .eq('id', duplicate.id);
      
      if (deleteError) {
        console.error(`Error deleting bank ${duplicate.id}: ${deleteError.message}`);
      } else {
        removedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} duplicate banks`,
      removedCount,
      duplicatesFound: duplicates.length
    });
  } catch (error: any) {
    console.error('Error fixing duplicate banks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fix duplicate banks' 
      },
      { status: 500 }
    );
  }
}